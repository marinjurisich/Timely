import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, timer } from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

@Injectable()
export class HomeComponent {

  public clicked: boolean = false;
  public time: number = 0;
  public timer_subscription: Subscription;
  public StartTime: Date;
  public EndTime: Date;
  public timerDisplay: {
    hours: { digit1: string; digit2: string; },
    minutes: { digit1: string; digit2: string; },
    seconds: { digit1: string; digit2: string; },
  };
  public lastIndex: number;
  public firstIndex: number;
  public projects: {};

  constructor(private http: HttpClient) { }

  start_timer = () => {

    //start timer
    this.StartTime = new Date();
    this.timer_subscription = timer(0, 1000).subscribe(ec => {
      this.time++;
      this.timerDisplay = this.getDisplayTimer(this.time);
    });

    //hide start button, display stop button
    this.clicked = true;

  }

  stop_timer = () => {

    this.EndTime = new Date();

    //stop timer, display current time
    this.timer_subscription.unsubscribe();
    this.timerDisplay = this.getDisplayTimer(this.time);

    //open modal and reset the start/stop button
    this.open_modal();
    this.clicked = false;

  }

  //parse time into readable string
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


  load_data = async (index: string = "0", reverse: boolean = false) => {
    debugger;
    var url: string; 

    if (reverse) {
      url = "/api/Projects/GetReversed?lastId=" + index;
    } else {
      url = "/api/Projects/Get?lastId=" + index;
    }

    this.http.get(url, {}).subscribe(p => {

      // @ts-ignore
      for (var project of p) {
        //parse time into string to display
        project["Duration"] = this.getDisplayTimer(project["Duration"]);

        //parse datetimes
        let start: Date = new Date(project["StartTime"]);
        let end: Date = new Date(project["EndTime"]);
        project["StartTime"] = start.toDateString() + ", " + start.toLocaleTimeString();
        project["EndTime"] = end.toDateString() + ", " + end.toLocaleTimeString();

      }

      debugger;

      if (reverse) {
        // @ts-ignore
        p = p.reverse();
      }

      //fetch id of first and last element for pagination
      // @ts-ignore
      this.lastIndex = p.at(-1)["Id"];
      // @ts-ignore
      this.firstIndex = p.at(0)["Id"];

      this.projects = p;

    });
    //display table
    document.getElementById("dataTable").classList.remove("d-none");

  }

  saveProject = async () => {
    debugger;
    // @ts-ignore
    var projectName: string = document.getElementById("projectNameInput").value;
    let project: {} = {};

    project["Name"] = projectName;
    project["StartTime"] = this.StartTime.toISOString();
    project["EndTime"] = this.EndTime.toISOString();
    project["Duration"] = this.time;

    await this.http.post<any>("/api/Projects/Save", project)
      .subscribe();

    await this.load_data();

  }

  next_10 = (elem) => {
    this.load_data(elem.id);
  }

  prev_10 = (elem) => {
    this.load_data(elem.id, true);
  }

  open_modal = () => {
    document.getElementsByClassName("custom_modal")[0].classList.remove("d-none");
  }

  close_modal = () => {
    document.getElementsByClassName("custom_modal")[0].classList.add("d-none");
  }

  ngOnInit() {

    //set event to close modal on click outside of modal
    window.onclick = function (event) {
      if (event.target == document.getElementsByClassName("custom_modal")[0]) {
        document.getElementsByClassName("custom_modal")[0].classList.add("d-none");
      }
    }

  }


}
