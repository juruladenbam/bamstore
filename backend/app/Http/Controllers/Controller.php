<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="BAM Store API",
 *      description="API Documentation for BAM Store",
 *      @OA\Contact(
 *          email="admin@bamstore.com"
 *      )
 * )
 *
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="Demo API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer"
 * )
 */
abstract class Controller
{
    //
}
