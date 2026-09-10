package main

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestSanitizeUploadName(t *testing.T) {
	cases := map[string]string{
		"My Test Clip.mp4":      "My_Test_Clip.mp4",
		"../../etc/passwd.mp4":  "passwd.mp4",
		"weird@na!me.mp4":       "weirdname.mp4",
		"clip.mp4":              "clip.mp4",
		".hidden.mp4":           "hidden.mp4",
		"UPPER.MP4":             "UPPER.MP4",
	}
	for in, want := range cases {
		if got := sanitizeUploadName(in); got != want {
			t.Errorf("sanitizeUploadName(%q) = %q, want %q", in, got, want)
		}
	}
}

// multipartBody builds a multipart form with a single file field (or no field
// when fieldName is empty) and returns the body plus its Content-Type.
func multipartBody(t *testing.T, fieldName, filename string, content []byte) (*bytes.Buffer, string) {
	t.Helper()
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	if fieldName != "" {
		fw, err := w.CreateFormFile(fieldName, filename)
		if err != nil {
			t.Fatalf("CreateFormFile: %v", err)
		}
		if _, err := fw.Write(content); err != nil {
			t.Fatalf("write: %v", err)
		}
	}
	if err := w.Close(); err != nil {
		t.Fatalf("close: %v", err)
	}
	return &buf, w.FormDataContentType()
}

func uploadRequest(t *testing.T, fieldName, filename string, content []byte) *http.Request {
	t.Helper()
	body, contentType := multipartBody(t, fieldName, filename, content)
	req := httptest.NewRequest(http.MethodPost, "/videos", body)
	req.Header.Set("Content-Type", contentType)
	return req
}

func newTestServer(t *testing.T) *server {
	t.Helper()
	return newServer(config{VideosDir: t.TempDir(), MaxConcurrent: 1, CORSOrigins: "*"})
}

func TestHandleUploadStoresAndEnqueues(t *testing.T) {
	s := newTestServer(t)
	rr := httptest.NewRecorder()
	s.handleUpload(rr, uploadRequest(t, "file", "My Test Clip.mp4", []byte("fake-video-bytes")))

	if rr.Code != http.StatusAccepted {
		t.Fatalf("status = %d, want 202; body=%s", rr.Code, rr.Body.String())
	}
	var got videoInfo
	if err := json.Unmarshal(rr.Body.Bytes(), &got); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if got.Name != "My_Test_Clip.mp4" {
		t.Errorf("stored name = %q, want My_Test_Clip.mp4", got.Name)
	}
	// File landed on disk under the sanitised name.
	if _, err := os.Stat(filepath.Join(s.cfg.VideosDir, "My_Test_Clip.mp4")); err != nil {
		t.Errorf("expected stored file: %v", err)
	}
	// And it was registered for preparation.
	if st, ok := s.reg.get("My_Test_Clip.mp4"); !ok || st.Status != statusPending {
		t.Errorf("registry = %+v (ok=%v), want pending", st, ok)
	}
}

func TestHandleUploadRejectsBadExtension(t *testing.T) {
	s := newTestServer(t)
	rr := httptest.NewRecorder()
	s.handleUpload(rr, uploadRequest(t, "file", "notes.txt", []byte("hello")))

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rr.Code)
	}
	if _, err := os.Stat(filepath.Join(s.cfg.VideosDir, "notes.txt")); !os.IsNotExist(err) {
		t.Errorf("rejected upload must not be stored")
	}
}

func TestHandleUploadRejectsDuplicate(t *testing.T) {
	s := newTestServer(t)
	first := httptest.NewRecorder()
	s.handleUpload(first, uploadRequest(t, "file", "clip.mp4", []byte("a")))
	if first.Code != http.StatusAccepted {
		t.Fatalf("first upload status = %d, want 202", first.Code)
	}
	second := httptest.NewRecorder()
	s.handleUpload(second, uploadRequest(t, "file", "clip.mp4", []byte("b")))
	if second.Code != http.StatusConflict {
		t.Fatalf("duplicate status = %d, want 409", second.Code)
	}
}

func TestHandleUploadMissingFile(t *testing.T) {
	s := newTestServer(t)
	rr := httptest.NewRecorder()
	s.handleUpload(rr, uploadRequest(t, "", "", nil))
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rr.Code)
	}
}

// The router must send POST /videos to the uploader and GET /videos to the lister.
func TestRouterDispatchesUploadVsList(t *testing.T) {
	s := newTestServer(t)

	post := httptest.NewRecorder()
	s.ServeHTTP(post, uploadRequest(t, "file", "routed.mp4", []byte("x")))
	if post.Code != http.StatusAccepted {
		t.Fatalf("POST /videos status = %d, want 202", post.Code)
	}

	get := httptest.NewRecorder()
	s.ServeHTTP(get, httptest.NewRequest(http.MethodGet, "/videos", nil))
	if get.Code != http.StatusOK {
		t.Fatalf("GET /videos status = %d, want 200", get.Code)
	}
	if !bytes.Contains(get.Body.Bytes(), []byte("routed.mp4")) {
		t.Errorf("GET /videos did not list the uploaded file: %s", get.Body.String())
	}
}
