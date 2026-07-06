package com.projectshop.exception;

/**
 * Thrown when trying to create a category whose name already exists
 * (case-insensitive) — categories must be unique by name.
 */
public class DuplicateCategoryException extends RuntimeException {

    public DuplicateCategoryException(String name) {
        super("A category named '" + name + "' already exists");
    }
}
