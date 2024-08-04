import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { City } from './city';
import { Country } from '../countries/country';
import { BaseFormComponent } from '../base-form.component';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
  title?: string;
  city?: City;
  url: string = environment.apiBaseUrl + 'Cities/';
  id?: number;
  countries? : Country[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) { 
      super()
  }

  ngOnInit(){
    this.form = new FormGroup({
      name: new FormControl('', [ Validators.required]),
      lat: new FormControl ('', [ Validators.required,Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)]),
      lon: new FormControl ('', [ Validators.required,Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)]),
      countryId :new FormControl('',[ Validators.required ])
    },null,this.isDupeCity());
    this.loadData();
  }
  loadData(){
    // retrive the ID from the id parameter
    this.loadCountries();
    var idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam :0 ;
    //Edit mode
    if(this.id){
        //fetch the city from the server
      var url = this.url +this.id;
      this.cityService.get(this.id).subscribe(result => {
        this.city =result;
        this.title = "Edit - " + this.city.name;
        //update the form with the city value
        this.form.patchValue(this.city);  
      },error => console.error(error));
     } 
    else {
     // Add new mode
     this.title="Create a new City";
    }
  }
  onSubmit(){
    var city =(this.id) ? this.city: <City>{};
    if(city){
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;
      if(this.id){
        //Edit Mode
          this.cityService 
              .put(city)
              .subscribe(result => {
                console.log("City " + city!.id + "has been updated.");
                // go back to cities view
                this.router.navigate(['/cities']);
              },error => console.error(error));
      }
      else{
        //Add new Mode
          var url = this.url ;
          this.cityService
            .post( city)
            .subscribe(result => {
              console.log("City " + result.id + "has been created" );
              // go back to cities view
              this.router.navigate(['/cities']);
            }, error => console.error(error));
      }
    }
  }
  loadCountries(){
     var url = environment.apiBaseUrl + 'Countries';
      this.cityService.getCountries(0,9999,"name","asc",null,null).subscribe(result =>{
        this.countries = result.data;
      }, error => console.error(error));
  }
  isDupeCity(): AsyncValidatorFn{
    return (control: AbstractControl): Observable<{ [key:string]: any} | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id :0;
      city.name = this.form.controls['name'].value;
      city.lat = this.form.controls['lat'].value;
      city.lon = this.form.controls['lon'].value;
      city.countryId = this.form.controls['countryId'].value;
      return this.cityService.isDupeCity(city)
          .pipe(map(result => {
        return (result ? {isDupeCity:true} :null);}
      ));

    }

  }
}
