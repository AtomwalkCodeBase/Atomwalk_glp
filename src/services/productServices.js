import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, 
  getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getActivities, getActivityQc, processActivity, 
  bookingListURL, getGLPGroup, getGLPTest, getGLPTestData, processGLPTestData, projectList } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost } from "./HttpMethod";

export function getEmpLeave(leave_type , emp_id, year) {
    let data = {};
    if (leave_type ){
        data['leave_type '] = leave_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    if (year){
        data['year'] = year;
    }
  
    // console.log('getUserTasks', task_type, userTaskListURL, data)
    return authAxios(getEmpLeavedata, data)
  }
  
  export function postEmpLeave(leave_type) {
    let data = {};
    if (leave_type) {
      data['leave_data'] = leave_type;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(addEmpLeave, data)
  
  }

  export function postClaim(claim_data) {
    let data = {};
    if (claim_data) {
      data = claim_data;
    }
    // console.log('Data to be sent:', claim_data);
    return authAxiosFilePost(addClaim, claim_data)
  }

  export function postClaimAction(claim_type) {
    let data = {};
    if (claim_type) {
      data['claim_data'] = claim_type;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(processClaim, data)
  
  }

  export function getClaimApprover() { 
    let data = {};
    return authAxios(getClaimApproverList)
  }

  export function getEmpClaim(res) {
    let data = {
      'call_mode':res
    };
    
    // console.log(res)
    return authAxios(getEmpClaimdata, data)
  }

  export function getExpenseItem() { 
    return authAxios(getExpenseItemList)
  }


  export function getUserBooking() { 
    return authAxios(bookingListURL)
  }

  export function getExpenseProjectList() { 
    return authAxios(getProjectList)
  }

  export function getEmpAttendance(res) {
    let data = {
      'emp_id':res.emp_id,
      'month':res.month,
      'year': res.year
    };
    // console.log('Final response data',data)
    return authAxios(getEmpAttendanceData, data)
  }

  export function getEmpHoliday(res) {
    let data = {
      'year': res.year
    };
    // console.log(data,'Final response data')
    return authAxios(getEmpHolidayData, data)
  }

  export function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
      // data = checkin_data;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(empCheckData, data)
  }


  export function getActivityList() { 
    
    return authAxios(getActivities)
  }

  export function getManagerActivityList(res) { 
    let data = {
      'call_mode': res.call_mode 
    };
    console.log('callt type==',res.call_mode)
    return authAxios(getActivities,data)
  }

  

  export function getActivitiQcData(res) {

    let data = {
      'activity_id':res.activity_id,
      'call_mode': res.call_mode 

    };
    
    // console.log('Data==',data)
    return authAxios(getActivityQc, data)
  }


  export function postActivtyInventory(activity_invt_process) {
    let data = {};
    if (activity_invt_process) {
      data['activity_data'] = activity_invt_process;
    }
    // console.log('Data to be sent:', data);s
    return authAxiosPost(processActivity, data)
  
  }

export function getGLPGroupList(ref_num) {
  let data = {
    // project_id:,
    'project_code': ref_num
  }
  return authAxios(getGLPGroup, data)
}

export function getGLPTestList(ref_num) {
  let data = {
    'project_code': ref_num
  };
  return authAxios(getGLPTest, data)
}

export function getGLPTestDataList(ref_num) {
  let data = {
    'project_code': ref_num,
  };
  return authAxios(getGLPTestData, data)
}

export function postGLPTestData(payload) {
  let data = {};
  if (payload) {
    data['test_data'] = payload;
  }
  // console.log('Data to be sent:', JSON.stringify(data, null, 2));
  return authAxiosPost(processGLPTestData, data)
}

export function getGLPProjectList(){
  return authAxios(projectList)
}