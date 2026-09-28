from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
from auth import (
    hash_password,
    verify_password,
    create_token,
    SECRET_KEY,
    ALGORITHM
)

from database import engine, Base, SessionLocal
import models

from schemas import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    CourseCreate,
    CourseResponse,
    ResultCreate,
    ResultResponse,
    AttendanceCreate,
    AttendanceResponse,
    UserCreate,
    UserResponse,
    LoginRequest
)


# APP SETUP

app = FastAPI()

def create_default_admin():
    db = SessionLocal()

    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")

        existing_admin = db.query(models.User).filter(
            models.User.email == admin_email
        ).first()

        if not existing_admin:
            admin = models.User(
                username="Admin",
                email=admin_email,
                password=hash_password(admin_password),
                role="admin"
            )

            db.add(admin)
            db.commit()

            print("Default admin account created.")

        else:
            print("Admin account already exists.")

    finally:
        db.close()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

Base.metadata.create_all(bind=engine)
create_default_admin()


# DATABASE

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# AUTHENTICATION

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ADMIN PROTECTION

def get_admin_user(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# HOME

@app.get("/")
def home():
    return {
        "message": "Student Management System API"
    }


# STUDENT CRUD

# CREATE STUDENT - ADMIN ONLY

@app.post(
    "/students",
    status_code=201,
    response_model=StudentResponse
)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    new_student = models.Student(
        name=student.name,
        email=student.email,
        age=student.age,
        course=student.course,
        is_active=student.is_active
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# GET ALL STUDENTS

@app.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db)
):
    students = db.query(models.Student).all()

    return students


# GET SINGLE STUDENT

@app.get(
    "/students/{student_id}",
    response_model=StudentResponse
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# UPDATE STUDENT - ADMIN ONLY

@app.put(
    "/students/{student_id}",
    response_model=StudentResponse
)
def update_student(
    student_id: int,
    student: StudentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    existing_student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not existing_student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    existing_student.name = student.name
    existing_student.email = student.email
    existing_student.age = student.age
    existing_student.course = student.course
    existing_student.is_active = student.is_active

    db.commit()
    db.refresh(existing_student)

    return existing_student


# DELETE STUDENT - ADMIN ONLY

@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully"
    }


# COURSE CRUD

# CREATE COURSE - ADMIN ONLY

@app.post(
    "/courses",
    status_code=201,
    response_model=CourseResponse
)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    new_course = models.Course(
        code=course.code,
        name=course.name,
        instructor=course.instructor,
        credits=course.credits
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


# GET COURSES

@app.get(
    "/courses",
    response_model=list[CourseResponse]
)
def get_courses(
    db: Session = Depends(get_db)
):
    courses = db.query(models.Course).all()

    return courses


# GET SINGLE COURSE

@app.get(
    "/courses/{course_id}",
    response_model=CourseResponse
)
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


# UPDATE COURSE - ADMIN ONLY

@app.put(
    "/courses/{course_id}",
    response_model=CourseResponse
)
def update_course(
    course_id: int,
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    existing_course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not existing_course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    existing_course.code = course.code
    existing_course.name = course.name
    existing_course.instructor = course.instructor
    existing_course.credits = course.credits

    db.commit()
    db.refresh(existing_course)

    return existing_course


# DELETE COURSE - ADMIN ONLY

@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }


# RESULT CRUD

# CREATE RESULT - ADMIN ONLY

@app.post(
    "/results",
    status_code=201,
    response_model=ResultResponse
)
def create_result(
    result: ResultCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    new_result = models.Result(
        student_id=result.student_id,
        course_id=result.course_id,
        marks=result.marks,
        grade=result.grade,
        semester=result.semester
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return new_result


# GET RESULTS

@app.get(
    "/results",
    response_model=list[ResultResponse]
)
def get_results(
    db: Session = Depends(get_db)
):
    results = db.query(models.Result).all()

    return results


# GET SINGLE RESULT

@app.get(
    "/results/{result_id}",
    response_model=ResultResponse
)
def get_result(
    result_id: int,
    db: Session = Depends(get_db)
):
    result = db.query(models.Result).filter(
        models.Result.id == result_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    return result


# UPDATE RESULT - ADMIN ONLY

@app.put(
    "/results/{result_id}",
    response_model=ResultResponse
)
def update_result(
    result_id: int,
    result: ResultCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    existing_result = db.query(models.Result).filter(
        models.Result.id == result_id
    ).first()

    if not existing_result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    existing_result.student_id = result.student_id
    existing_result.course_id = result.course_id
    existing_result.marks = result.marks
    existing_result.grade = result.grade
    existing_result.semester = result.semester

    db.commit()
    db.refresh(existing_result)

    return existing_result


# DELETE RESULT - ADMIN ONLY

@app.delete("/results/{result_id}")
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    result = db.query(models.Result).filter(
        models.Result.id == result_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    db.delete(result)
    db.commit()

    return {
        "message": "Result deleted successfully"
    }


# ATTENDANCE CRUD

# CREATE ATTENDANCE - ADMIN ONLY

@app.post(
    "/attendance",
    status_code=201,
    response_model=AttendanceResponse
)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    new_attendance = models.Attendance(
        student_id=attendance.student_id,
        course_id=attendance.course_id,
        date=attendance.date,
        status=attendance.status
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance


# GET ATTENDANCE

@app.get(
    "/attendance",
    response_model=list[AttendanceResponse]
)
def get_attendance(
    db: Session = Depends(get_db)
):
    attendance = db.query(models.Attendance).all()

    return attendance


# GET SINGLE ATTENDANCE

@app.get(
    "/attendance/{attendance_id}",
    response_model=AttendanceResponse
)
def get_single_attendance(
    attendance_id: int,
    db: Session = Depends(get_db)
):
    attendance = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    return attendance


# UPDATE ATTENDANCE - ADMIN ONLY

@app.put(
    "/attendance/{attendance_id}",
    response_model=AttendanceResponse
)
def update_attendance(
    attendance_id: int,
    attendance_data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    existing_attendance = db.query(
        models.Attendance
    ).filter(
        models.Attendance.id == attendance_id
    ).first()

    if not existing_attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    existing_attendance.student_id = attendance_data.student_id
    existing_attendance.course_id = attendance_data.course_id
    existing_attendance.date = attendance_data.date
    existing_attendance.status = attendance_data.status

    db.commit()
    db.refresh(existing_attendance)

    return existing_attendance


# DELETE ATTENDANCE - ADMIN ONLY

@app.delete("/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    attendance = db.query(
        models.Attendance
    ).filter(
        models.Attendance.id == attendance_id
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    db.delete(attendance)
    db.commit()

    return {
        "message": "Attendance deleted successfully"
    }



# REGISTER


@app.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_student = db.query(models.Student).filter(
        models.Student.email == user.email
    ).first()

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Student with this email already exists"
        )

    hashed_password = hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_student = models.Student(
        name=user.username,
        email=user.email,
        age=0,
        course="",
        is_active=True
    )

    db.add(new_student)
    db.commit()

    return new_user



# LOGIN


@app.post("/login")
def login_user(
    user: LoginRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(
        existing_user.id,
        existing_user.role
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "username": existing_user.username,
        "role": existing_user.role
    }


# PROFILE

@app.get("/profile")
def profile(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "message": "You are logged in",
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }


class ProfileUpdate(BaseModel):
    username: str
    email: str


@app.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.username = profile_data.username
    current_user.email = profile_data.email

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }


# ADMIN TEST

@app.get("/admin-test")
def admin_test(
    current_user: models.User = Depends(get_admin_user)
):
    return {
        "message": "Welcome Admin",
        "username": current_user.username,
        "role": current_user.role
    }