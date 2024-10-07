import {model,Schema} from 'mongoose'
const courseSchema = new Schema({
    title:{
        type:String,
        require:[true,"title is required"],
        minLength:[3,"title  must be 3 characters"],
        maxLength:[80,"title must be less than 80 characters"],
        trim :true,
    },
    description:{
        type:String,
        require:[true,"Description is required"],
        minLength:[3,"Description  must be 3 characters"],
        maxLength:[400,"Description must be less than 400 characters"],
        trim : true,
    },
    category:{
        type:String,
        require:[true,"CAtegory is required"],
        trim : true,
    },
    thumbnail:{
        public_id:{
            type:String,
            require:true,
        },
        secure_url:{
            type:String,
            require:true
        }
    },
    lectures:[{
        title:String,
        description:String,
        lecture:{
            public_id:{
                type:String,
                require:true
            },
            secure_url:{
                type:String,
                require:true
            }  
        }
    }],
    numberOfLectures:{
        type:Number,
        default:0
    },
    createdBy:{
        type :String,
        require:true
    }
},{
    timestamps:true
})

const Course =new model ('Course', courseSchema);
export default Course;