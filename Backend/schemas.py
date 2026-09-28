from pydantic import BaseModel


class StudentCreate(BaseModel):
    name: str
    email: str
    age: int
    course: str
    is_active: bool = True

class StudentUpdate(BaseModel):
    name: str
    email: str
    age: int
    course: str
    is_active: bool

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int
    course: str
    is_active: bool

    class Config:
        from_attributes = True
class CourseCreate(BaseModel):
    code: str
    name: str
    instructor: str
    credits: int


class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    instructor: str
    credits: int

    class Config:
        from_attributes = True

class ResultCreate(BaseModel):
    student_id: int
    course_id: int
    marks: int
    grade: str
    semester: int


class ResultResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    marks: int
    grade: str
    semester: int

    class Config:
        from_attributes = True
class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    date: str
    status: str


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    date: str
    status: str

    class Config:
        from_attributes = True

# User schema


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str
