import React, { Component } from 'react';
import moment, { parseZone } from 'moment'
import axios from 'axios'
import { AppointmentPicker } from 'react-appointment-picker';
import './Scheduler.css'
export default class Scheduler extends Component {
  state = {
    continuousLoading: false,
    lastDate: ''
  };
  

  async addAppointment(time) {
    try {
      await axios.post("localhost:5000/newappointment", {
        date: time,
        hospitalId: this.props.hospitalId
      }, {
        headers: {
          "authorization": localStorage.getItem('token'),
      }})
    }
    catch (e) {

    }
  }

  async removeAppointment(time) {
    try {
      await axios.post("localhost:5000/remove-appointment", {
        date: time,
        hospitalId: this.props.hospitalId
      }, {
        headers: {
          "authorization":localStorage.getItem('token'),
      }})
    }
    catch (e) {
      
    }
  }

  addAppointmentCallbackContinuousCase = ({
    addedAppointment: { day, number, time, id },
    addCb,
    removedAppointment: params,
    removeCb
  }) => {
    this.setState(
      {
        continuousLoading: true
      },
      async () => {
        await this.removeAppointment(this.state.lastDate)
        if (removeCb) {
          removeCb(params.day, params.number);
        }
        await this.addAppointment(time)
        addCb(day, number, time, id);
        this.setState({ continuousLoading: false, lastDate: time });
      }
    );
  };

  removeAppointmentCallbackContinuousCase = (
    { day, number, time, id },
    removeCb
  ) => {
    this.setState(
      {
        continuousLoading: true
      },
      async () => {
        await this.removeAppointment(time)
        removeCb(day, number);
        this.setState({ continuousLoading: false });
      }
    );
  };

  findDate(arr, date) {
    for(let i = 0; i < arr.length; i++) {
      if(moment(arr[i]).isSame(date)) {
        return true
      }
    }
    return false
  }

  generateDays () {
    const startHour = this.props.startHour
    const endHour = this.props.endHour
    let currentHour
    
    let days = []
    for(let i = 0; i < 7; i++) {
      currentHour = moment(Object.assign({}, this.props.startHour))
      let day = []
      let j = 0;
      while(currentHour.isBefore(endHour) || currentHour.isSame(endHour)) {
        if(!this.findDate(this.props.scheduledHours[i], currentHour)) {
          day.push({number: j})
        }
        else {
          day.push({number: j, isReserved: true})
        }
        currentHour = currentHour.add(60, 'minutes')
        j++;
      } 
      days.push(day)     
    }
    return days
  }

  render() {
  
    const days = this.generateDays()
    const { loading, continuousLoading } = this.state;
    console.log(this.generateDays())
    return (
      <div className="Scheduler">
        <h3 className="h3">Schedule your next blood donation</h3>
        <AppointmentPicker className="AppointmentPicker"
          addAppointmentCallback={this.addAppointmentCallbackContinuousCase}
          removeAppointmentCallback={
            this.removeAppointmentCallbackContinuousCase
          }
          initialDay={new Date(this.props.startHour)}
          days={days}
          maxReservableAppointments={1}
          alpha
          visible
          selectedByDefault
          loading={continuousLoading}
          unitTime={60 * 60 * 1000}
          continuous
        />
      </div>
    );
  }
}