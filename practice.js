const arr = ["aniket", "gore", "class", "btech", "cse"];

const student = (arr, cb) =>{
    for(let i = 0; i < arr.length; i++){
        let name = arr[i];
        cb(name);
    }
}

const iterate = (name) =>{
    console.log(name)
}

student(arr, (name)=>{
    console.log(name);
})