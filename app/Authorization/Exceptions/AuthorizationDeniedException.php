<?php

namespace App\Authorization\Exceptions;

use Exception;

/**
 * Authorization Denied Exception
 *
 * Thrown when a user is not authorized to perform an action.
 */
class AuthorizationDeniedException extends Exception
{
    /**
     * The permission that was denied.
     *
     * @var string|null
     */
    protected ?string $permission;

    /**
     * Create a new authorization denied exception.
     *
     * @param string $message
     * @param string|null $permission
     * @param int $code
     * @param Exception|null $previous
     */
    public function __construct(
        string $message = '',
        ?string $permission = null,
        int $code = 403,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->permission = $permission;
    }

    /**
     * Get the permission that was denied.
     *
     * @return string|null
     */
    public function getPermission(): ?string
    {
        return $this->permission;
    }

    /**
     * Create exception for a specific permission.
     *
     * @param string $permission
     * @return static
     */
    public static function forPermission(string $permission): static
    {
        return new static(
            "You do not have permission to perform this action: {$permission}",
            $permission
        );
    }
}