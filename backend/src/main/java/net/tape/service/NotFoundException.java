package net.tape.service;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String what, String id) {
        super(what + " not found: " + id);
    }
}
