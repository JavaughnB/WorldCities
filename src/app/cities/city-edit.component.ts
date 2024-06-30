import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute,Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { environment } from 'src/environments/environment';
import { City } from './city';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient) { 
  }

  ngOnInit(){
    this.form = new FormGroup({
      name: new FormControl(''),
      lat: new FormControl(''),
      lon: new FormControl('')
    });
    this.loadData();
  }
  loadData(){
    // retrive the ID from the id parameter
    var idParam = this.activatedRoute.snapshot.paramMap.get('id');
    var id = idParam ? + idParam :0 ;
    //Edit mode
    if(this.id){
        //fetch the city from the server
      var url = this.url +id;
      this.http.get<City>(url).subscribe(result => {
        this.city =result;
        this.title = "Edit - " + this.city.name;

        //update the form with the city value
        this.form.patchValue(this.city);  
      },error => console.error(error));
     } 
    //else {
      //Add new mode
     // this.title="Create a new City";
    //}
  }
  onSubmit(){
    var city =(this.id) ? this.city: <City>{};
    if(city){
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      if(this.id){
        //Edit Mode
          var url = this.url + city.id;
          this.http 
              .put<City>(url,city)
              .subscribe(result => {
                console.log("City " + city!.id + "has been updated.");
                // go back to cities view
                this.router.navigate(['/ciites']);
              },error => console.error(error));
      }
      else{
        //Add new Mode
          var url = this.url + 'Cities';
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
}
