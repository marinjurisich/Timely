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

  public clicked: boolean = false; //is start button clicked?
  public time: number = 0; //time elapsed in seconds
  public timerSubscription: Subscription;
  public StartTime: Date;
  public EndTime: Date;
  public timerDisplay: { //time parsed for display
    hours: { digit1: string; digit2: string; },
    minutes: { digit1: string; digit2: string; },
    seconds: { digit1: string; digit2: string; },
  };
  public lastIndex: number; //id of last row in table
  public firstIndex: number; //id of first row in table
  public projects: {}; //all fetched projects
  public editingProject: {}; //project picked for editing

  constructor(private http: HttpClient) { }

  startTimer = () => {

    //start timer
    this.StartTime = new Date();
    this.timerSubscription = timer(0, 1000).subscribe(ec => {
      this.time++;
      this.timerDisplay = this.getDisplayTimer(this.time);
    });

    //hide start button, display stop button
    this.clicked = true;

  }

  stopTimer = () => {

    this.EndTime = new Date();

    //stop timer, display current time
    this.timerSubscription.unsubscribe();
    this.timerDisplay = this.getDisplayTimer(this.time);

    //open modal and reset the start/stop button
    this.openModal();
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

  //initial loading and pagination
  loadData = async (index: string = "0", reverse: boolean = false) => {
    
    var url: string; 

    if (reverse) {
      url = "/api/Projects/GetReversed?lastId=" + index;
    } else {
      url = "/api/Projects/Get?lastId=" + index;
    }

    await this.http.get(url, {}).subscribe(p => {

      // @ts-ignore
      for (var project of p) {
        //parse time into string to display
        project["DurationDisplay"] = this.getDisplayTimer(project["Duration"]);

        //parse datetimes
        let start: Date = new Date(project["StartTime"]);
        let end: Date = new Date(project["EndTime"]);
        project["StartTime"] = start.toDateString() + ", " + start.toLocaleTimeString();
        project["EndTime"] = end.toDateString() + ", " + end.toLocaleTimeString();

      }

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

    // @ts-ignore
    var projectName: string = document.getElementById("projectNameInput").value;
    let project: {} = {};

    //stops StartTime from being overwritten by startTimer in case of edit
    //@ts-ignore
    if (this.editingProject) {
      //@ts-ignore
      this.StartTime = new Date(this.editingProject["StartTime"]);
      project["Id"] = this.editingProject["Id"];
    }

    project["Name"] = projectName;
    project["StartTime"] = this.StartTime.toISOString();
    project["EndTime"] = this.EndTime.toISOString();
    project["Duration"] = this.time;

    //reset time after a project has been saved
    this.time = 0;
    this.timerDisplay = this.getDisplayTimer(this.time);

    await this.http.post<any>("/api/Projects/Save", project)
      .subscribe();

    if (this.firstIndex) {

      await this.refreshTable(this.firstIndex);

    } else {

      await this.loadData();

    }

  }

  editProject = async (projectId) => {

    // @ts-ignore
    var project: {} = this.projects.find(element => element.Id == projectId)

    //set time
    //@ts-ignore
    this.time = project.Duration;
    this.timerDisplay = this.getDisplayTimer(this.time);

    //@ts-ignore
    document.getElementById("projectNameInput").value = project.Name;
    //@ts-ignore
    document.getElementById("projectNameDisplay").innerText = project.Name;
    document.getElementById("resetButton").classList.remove("d-none");

    this.editingProject = project;

}

  deleteProject = async (id: number) => {

    var url: string = "api/Projects/Delete?delId=" + id.toString();

    await this.http.get(url, {})
      .subscribe(data => {
        setTimeout(() => { this.refreshTable(this.firstIndex) }, 100)
      });

  }

  //refresh table data
  refreshTable = async (id: number) => {

    var url = "/api/Projects/Refresh?projectId=" + id.toString();

    await this.http.get(url, {}).subscribe(p => {

      // @ts-ignore
      for (var project of p) {
        //parse time into string to display
        project["DurationDisplay"] = this.getDisplayTimer(project["Duration"]);

        //parse datetimes
        let start: Date = new Date(project["StartTime"]);
        let end: Date = new Date(project["EndTime"]);
        project["StartTime"] = start.toDateString() + ", " + start.toLocaleTimeString();
        project["EndTime"] = end.toDateString() + ", " + end.toLocaleTimeString();

      }

      //fetch id of first and last element for pagination
      // @ts-ignore
      this.lastIndex = p.at(-1)["Id"];
      // @ts-ignore
      this.firstIndex = p.at(0)["Id"];

      this.projects = p;

    });

  }

  //resets timer and selected editing project
  reset = () => {

    this.time = 0;
    this.timerDisplay = this.getDisplayTimer(this.time);
    this.editingProject = null;

    //@ts-ignore
    document.getElementById("projectNameInput").value = "";
    //@ts-ignore
    document.getElementById("projectNameDisplay").innerText = "";

  }

  deleteCurrent = async () => {

    if (this.editingProject) {
      await this.deleteProject(this.editingProject["Id"]);
    }

    this.reset();
}

  openModal = () => {
    document.getElementsByClassName("customModal")[0].classList.remove("d-none");
  }

  closeModal = () => {
    document.getElementsByClassName("customModal")[0].classList.add("d-none");
  }

  ngOnInit() {

    //set event to close modal on click outside of modal
    window.onclick = function (event) {
      if (event.target == document.getElementsByClassName("customModal")[0]) {
        document.getElementsByClassName("customModal")[0].classList.add("d-none");
      }
    }

  }


}
