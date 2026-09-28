from sqlalchemy import Column, Integer, String, Boolean,ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    age = Column(Integer)
    course = Column(String)
    is_active = Column(Boolean, default=True)
    results = relationship("Result", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")

    # Course mode;
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    instructor = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    results = relationship("Result", back_populates="course")
    attendance = relationship("Attendance", back_populates="course")  

# Result model

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer,ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer,ForeignKey("courses.id") ,nullable=False)

    marks = Column(Integer, nullable=False)
    grade = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    student = relationship("Student", back_populates="results")
    course = relationship("Course", back_populates="results")


    # Attendane
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer,ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer,ForeignKey("courses.id"), nullable=False)

    date = Column(String, nullable=False)
    status = Column(String, nullable=False)
    student = relationship("Student", back_populates="attendance")
    course = relationship("Course", back_populates="attendance")

# User model

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False)
    