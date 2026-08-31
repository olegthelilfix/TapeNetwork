# Stage 1: Build the Go binary
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Cache dependency downloads
COPY go.mod go.sum* ./
RUN go mod download 2>/dev/null || true

# Copy source and compile a static binary
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags='-s -w' -o /streamer .

# Stage 2: Minimal runtime with ffmpeg for stream processing
FROM alpine:3.20

RUN apk add --no-cache ffmpeg

COPY --from=builder /streamer /usr/local/bin/streamer

# Persistent dirs for source videos and HLS segment cache
RUN mkdir -p /data/videos /data/hls-cache

EXPOSE 8082

ENTRYPOINT ["streamer"]
