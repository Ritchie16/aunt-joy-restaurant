<?php

/**
 * Input Validation Middleware
 */
class Validation
{
    /**
     * Validate login input
     */
    public function validateLogin($data)
    {
        $errors = [];

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        }

        return $errors;
    }

    /**
     * Validate user registration
     */
    public function validateRegistration($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        } elseif (strlen($data['name']) < 2) {
            $errors['name'] = 'Name must be at least 2 characters';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        if (empty($data['phone'])) {
            $errors['phone'] = 'Phone number is required';
        }

        if (empty($data['address'])) {
            $errors['address'] = 'Delivery address is required';
        }

        return $errors;
    }

    /**
     * Validate user creation (admin)
     */
    public function validateUserCreation($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        if (empty($data['role'])) {
            $errors['role'] = 'Role is required';
        } elseif (!in_array($data['role'], ['admin', 'manager', 'sales', 'customer'])) {
            $errors['role'] = 'Invalid role specified';
        }

        return $errors;
    }

    /**
     * Validate meal creation
     */
    public function validateMealCreation($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Meal name is required';
        }

        if (empty($data['description'])) {
            $errors['description'] = 'Description is required';
        }

        if (empty($data['price'])) {
            $errors['price'] = 'Price is required';
        } elseif (!is_numeric($data['price']) || $data['price'] <= 0) {
            $errors['price'] = 'Valid price is required';
        }

        if (empty($data['category_id'])) {
            $errors['category_id'] = 'Category is required';
        } elseif (!is_numeric($data['category_id'])) {
            $errors['category_id'] = 'Valid category is required';
        }

        return $errors;
    }

    /**
     * Validate meal update
     */
    public function validateMealUpdate($data)
    {
        $errors = [];

        if (isset($data['name']) && empty($data['name'])) {
            $errors['name'] = 'Meal name cannot be empty';
        }

        if (isset($data['price']) && (!is_numeric($data['price']) || $data['price'] <= 0)) {
            $errors['price'] = 'Valid price is required';
        }

        if (isset($data['category_id']) && !is_numeric($data['category_id'])) {
            $errors['category_id'] = 'Valid category is required';
        }

        return $errors;
    }

    /**
     * Validate user update
     */
    public function validateUserUpdate($data)
    {
        $errors = [];

        if (isset($data['name']) && empty($data['name'])) {
            $errors['name'] = 'Name cannot be empty';
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        return $errors;
    }

    /**
     * Validate order creation
     */
    public function validateOrderCreation($data)
    {
        $errors = [];

        if (empty($data['total_amount'])) {
            $errors['total_amount'] = 'Total amount is required';
        } elseif (!is_numeric($data['total_amount']) || $data['total_amount'] <= 0) {
            $errors['total_amount'] = 'Valid total amount is required';
        }

        if (empty($data['delivery_address'])) {
            $errors['delivery_address'] = 'Delivery address is required';
        }

        if (empty($data['customer_phone'])) {
            $errors['customer_phone'] = 'Customer phone is required';
        }

        if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
            $errors['items'] = 'Order items are required';
        }

        return $errors;
    }
}
