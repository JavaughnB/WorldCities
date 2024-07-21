import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export abstract class BaseService {

  constructor( protected http: HttpClient) {}
}
