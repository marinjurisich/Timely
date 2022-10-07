import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer } from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

@Injectable()
export class HomeComponent {

  public clicked: boolean = false;
  time: number = 0;
  interval;
    timerDisplay: { hours: { digit1: string; digit2: string; }; minutes: { digit1: string; digit2: string; }; seconds: { digit1: string; digit2: string; }; };

  constructor(private http: HttpClient) { }

  start_timer = () => {
    timer(0, 1000).subscribe(ec => {
      this.time++;
      this.timerDisplay = this.getDisplayTimer(this.time);
    })
  }

  getDisplayTimer(time: number) {
    const hours = '0' + Math.floor(time / 3600);
    const minutes = '0' + Math.floor(time % 3600 / 60);
    const seconds = '0' + Math.floor(time % 3600 % 60);

    return {
      hours: { digit1: hours.slice(-2, -1), digit2: hours.slice(-1) },
      minutes: { digit1: minutes.slice(-2, -1), digit2: minutes.slice(-1) },
      seconds: { digit1: seconds.slice(-2, -1), digit2: seconds.slice(-1) },
    };
  }

  load_data = async () => {
    //this.http.get('/api/Projects/Get', {}).subscribe(j => console.log(j));
    this.clicked = true;
  }

  open_modal = () => {
    document.getElementsByClassName("custom_modal")[0].classList.remove("d-none");
  }

  close_modal = () => {
    document.getElementsByClassName("custom_modal")[0].classList.add("d-none");
  }

  ngOnInit() {
    console.log("INIT M8");

    window.onclick = function (event) {
      if (event.target == document.getElementsByClassName("custom_modal")[0]) {
        document.getElementsByClassName("custom_modal")[0].classList.add("d-none");
      }
    }



  }


}
