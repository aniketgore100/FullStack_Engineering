import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({

    name : "courses",
    initialState : {
        selectedCourseId : null,
    },

    reducers : {

        selectCourse(state, action){
            state.selectedCourseId = action.payload
        },
 

    }
})

export const {selectCourse} = courseSlice.actions;
export const selectSelectedCourseId = (state) => state.courses.selectedCourseId;
export default courseSlice.reducer