package com.projectshop.exception;

/**
 * Thrown when trying to delete a category that is still referenced
 * by one or more projects — deletion is blocked to avoid leaving
 * projects with a dangling/invisible category value.
 */
public class CategoryInUseException extends RuntimeException {

    public CategoryInUseException(String name, long projectCount) {
        super("Cannot delete category '" + name + "' — " + projectCount +
                " project" + (projectCount == 1 ? "" : "s") + " still assigned to it. " +
                "Reassign or remove those projects first.");
    }
}
