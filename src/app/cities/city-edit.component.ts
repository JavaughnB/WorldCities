import { Component, OnInit, Optional } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { ActivatedRoute,Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidator, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { City } from './city';
import { Country } from '../countries/country';
import { ObserversModule } from '@angular/cdk/observers';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent implements OnInit {
  title?: string;
  form!: FormGroup;
  city?: City;
  url: string = environment.apiBaseUrl + 'Cities/';
  id?: number;
  countries? : Country[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient) { 
  }

  ngOnInit(){
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', Validators.required),
      lon: new FormControl('', Validators.required),
      countryId :new FormControl('',Validators.required)
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
      this.http.get<City>(url).subscribe(result => {
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
          var url = this.url + city.id;
          this.http 
              .put<City>(url,city)
              .subscribe(result => {
                console.log("City " + city!.id + "has been updated.");
                // go back to cities view
                this.router.navigate(['/cities']);
              },error => console.error(error));
      }
      else{
        //Add new Mode
          var url = this.url ;
          this.http
            .post<City>(url, city)
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
     var params =  new HttpParams()
      .set("pageIndex","0")
      .set("pageSize","9999")
      .set("sortColumn", "name");
      this.http.get<any>(url, {params} ).subscribe(result =>{
        this.countries = result.data;
      }, error => console.error(error));
  }
  isDupeCity(): AsyncValidatorFn
   {
    return (control: AbstractControl): Observable<{ [key:string]: any} | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id :0;
      city.name = this.form.controls['name'].value;
      city.lat = this.form.controls['lat'].value;
      city.lon = this.form.controls['lon'].value;
      city.countryId = this.form.controls['countryId'].value;
      var url = this.url+ "IsDupeCity";
      return this.http.post<boolean>(url,city).pipe(map(result => {
        return (result ? {isDupeCity:true} :null);}
      ));

    }

  }
}
