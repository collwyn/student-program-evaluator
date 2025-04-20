// utils/dataGenerator.js
const Student = require('../models/Student');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate a random grade (50-100)
const generateRandomGrade = () => {
  return getRandomInt(50, 100);
};

// Function to generate progressively improving grades
const generateImprovingGrades = () => {
  const startGrade = getRandomInt(55, 70);
  const grades = {};
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  months.forEach((month, index) => {
    // Increase by 1-5 points each month (increased from 1-3)
    const improvement = getRandomInt(1, 5);
    grades[month] = Math.min(startGrade + (improvement * index), 100);
  });
  
  return grades;
};

// Function to generate declining grades
const generateDecliningGrades = () => {
  const startGrade = getRandomInt(75, 90);
  const grades = {};
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  months.forEach((month, index) => {
    // Decrease by 1-5 points each month (increased from 1-3)
    const decline = getRandomInt(1, 5);
    grades[month] = Math.max(startGrade - (decline * index), 40); // Lower minimum to 40
  });
  
  return grades;
};

// Function to generate stable grades with wider fluctuations
const generateStableGrades = (baseGrade) => {
  const grades = {};
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  months.forEach(month => {
    // Fluctuate by -10 to +10 points (increased from -5 to +5)
    const fluctuation = getRandomInt(-10, 10);
    grades[month] = Math.min(Math.max(baseGrade + fluctuation, 40), 100); // Lower minimum to 40
  });
  
  return grades;
};

// Function to generate a random essay about a class
const generateEssay = (className, performanceType) => {
  const positiveIntros = [
    `My experience in the ${className} class has been transformative.`,
    `The ${className} course exceeded my expectations in many ways.`,
    `I've found the ${className} program to be incredibly valuable for my development.`
  ];
  
  const neutralIntros = [
    `My time in the ${className} class has had its ups and downs.`,
    `The ${className} course provided some useful insights, though not without challenges.`,
    `I've had a mixed experience with the ${className} program.`
  ];
  
  const negativeIntros = [
    `I struggled to connect with the material in the ${className} class.`,
    `The ${className} course presented more challenges than I anticipated.`,
    `My journey through the ${className} program has been difficult.`
  ];
  
  const positiveDetails = [
    `The instructor's teaching methods were engaging and made complex concepts accessible. I particularly appreciated the hands-on projects that allowed us to apply what we learned in real-world scenarios. The collaborative environment fostered by both the instructor and my peers created a space where I felt comfortable asking questions and sharing ideas.`,
    `The curriculum was well-structured, building systematically from foundational concepts to more advanced applications. Each lesson seemed purposefully designed to reinforce previous learning while expanding our knowledge base. The feedback provided on assignments was detailed and constructive, giving me clear guidance on how to improve.`
  ];
  
  const neutralDetails = [
    `While some aspects of the course were well-executed, others felt underdeveloped. The theoretical components were thorough, but I would have benefited from more practical exercises. The instructor was knowledgeable but sometimes struggled to address the varying skill levels within our class.`,
    `The course materials were comprehensive, though occasionally outdated. Group projects provided valuable collaborative experience, but coordination challenges sometimes hindered our progress. I appreciate what I've learned, though I believe there's room for improvement in how the material is delivered.`
  ];
  
  const negativeDetails = [
    `The pace of the course felt rushed, making it difficult to fully grasp important concepts before moving on to new material. Instructions for assignments were often vague, leading to confusion and frustration. Despite my efforts to seek clarification, I frequently felt lost during class discussions.`,
    `The content seemed disconnected from practical applications, making it hard to see the relevance of what we were learning. The feedback on assignments was minimal, offering little guidance on how to improve. The classroom environment didn't feel conducive to asking questions, which further impeded my learning.`
  ];
  
  let intro, details;
  
  if (performanceType === 'Improved') {
    intro = positiveIntros[getRandomInt(0, positiveIntros.length - 1)];
    details = positiveDetails[getRandomInt(0, positiveDetails.length - 1)];
  } else if (performanceType === 'Struggled') {
    intro = negativeIntros[getRandomInt(0, negativeIntros.length - 1)];
    details = negativeDetails[getRandomInt(0, negativeDetails.length - 1)];
  } else {
    intro = neutralIntros[getRandomInt(0, neutralIntros.length - 1)];
    details = neutralDetails[getRandomInt(0, neutralDetails.length - 1)];
  }
  
  return `${intro} ${details}`;
};

// Function to generate random attendance (70-100%)
const generateAttendance = () => {
  const attendance = {};
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  months.forEach(month => {
    attendance[month] = getRandomInt(70, 100);
  });
  
  return attendance;
};

// Function to calculate average of grades
const calculateAverage = (grades) => {
  const values = Object.values(grades);
  return values.reduce((sum, grade) => sum + grade, 0) / values.length;
};

// Function to determine performance indicator based on grade trends
const determinePerformance = (grades) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Calculate first half average (Jan-Jun)
  const firstHalfGrades = months.slice(0, 6).map(month => grades[month]);
  const firstHalfAvg = firstHalfGrades.reduce((sum, grade) => sum + grade, 0) / firstHalfGrades.length;
  
  // Calculate second half average (Jul-Dec)
  const secondHalfGrades = months.slice(6).map(month => grades[month]);
  const secondHalfAvg = secondHalfGrades.reduce((sum, grade) => sum + grade, 0) / secondHalfGrades.length;
  
  // Determine performance based on improvement
  const improvement = secondHalfAvg - firstHalfAvg;
  
  if (improvement >= 5) {
    return 'Improved';
  } else if (improvement <= -5) {
    return 'Struggled';
  } else {
    return 'Neutral';
  }
};

// Function to determine class effectiveness based on average score - MODIFIED THRESHOLDS
const determineEffectiveness = (average) => {
  if (average >= 72) { // Lowered from 75 to 72
    return 'Effective';
  } else if (average >= 55) { // Raised from 50 to 55
    return 'Neutral';
  } else {
    return 'Ineffective';
  }
};

// Main function to generate all mock data
const generateMockData = async () => {
  console.log('Starting mock data generation...');

  // Create classes
  const classNames = [
    'Social Justice', 'STEM', 'Community Involvement', 'Violence Prevention', 
    'Critical Thinking', 'Finance 101', 'Sustainable Concepts', 
    'Environmental Studies', 'Computer Programming', 'Intro to Engineering'
  ];
  
  const classesCreated = [];
  
  for (const name of classNames) {
    const newClass = new Class({
      name,
      students: [],
      monthlyAverages: {},
      effectiveness: 'Neutral', // Will be calculated later
      yearAverage: 0
    });
    
    const savedClass = await newClass.save();
    classesCreated.push(savedClass);
  }

  console.log('Classes created:', classesCreated.map(c => ({ id: c._id, name: c.name })));
  
  // Create students
  const students = [];
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 
                    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 
                   'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
  
  // Store class grade data for later use
  const classGradeData = {};
  classesCreated.forEach(cls => {
    classGradeData[cls._id.toString()] = {
      totalGrades: {},
      counts: {}
    };
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    months.forEach(month => {
      classGradeData[cls._id.toString()].totalGrades[month] = 0;
      classGradeData[cls._id.toString()].counts[month] = 0;
    });
  });
  
  // Create a varied range of base grades for different classes to ensure varied effectiveness
  const classBaseGrades = {};
  classesCreated.forEach((cls, index) => {
    // Assign different base grades to different classes
    if (index < 3) {
      // Make some classes have high base grades (likely Effective)
      classBaseGrades[cls._id.toString()] = getRandomInt(75, 85);
    } else if (index >= classesCreated.length - 3) {
      // Make some classes have low base grades (likely Ineffective)
      classBaseGrades[cls._id.toString()] = getRandomInt(40, 54);
    } else {
      // The rest are in the middle (likely Neutral)
      classBaseGrades[cls._id.toString()] = getRandomInt(55, 71);
    }
  });
  
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
    const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
    const name = `${firstName} ${lastName}`;
    const age = getRandomInt(14, 18);
    const grade = ['9th', '10th', '11th', '12th'][getRandomInt(0, 3)];
    
    // Assign 4 random classes to each student
    const shuffledClasses = [...classesCreated].sort(() => 0.5 - Math.random());
    const assignedClasses = shuffledClasses.slice(0, 4);
    
    const studentClasses = assignedClasses.map(c => c._id);
    
    // Determine performance type (for generating appropriate grades)
    const performanceType = ['Improved', 'Neutral', 'Struggled'][getRandomInt(0, 2)];
    
    // Generate monthly grades for each class
    const monthlyGrades = {};
    
    assignedClasses.forEach(cls => {
      let grades;
      const classId = cls._id.toString();
      const baseGrade = classBaseGrades[classId]; // Use the predetermined base grade for this class
      
      if (performanceType === 'Improved') {
        // For improved performance, start lower than base grade and improve
        const adjustedStartGrade = Math.max(baseGrade - 15, 40);
        grades = generateImprovingGrades();
        // Adjust grades to be relative to the class base grade
        for (const month in grades) {
          grades[month] = Math.min(adjustedStartGrade + (grades[month] - 55), 100);
        }
      } else if (performanceType === 'Struggled') {
        // For struggling performance, start higher than base grade and decline
        const adjustedStartGrade = Math.min(baseGrade + 15, 95);
        grades = generateDecliningGrades();
        // Adjust grades to be relative to the class base grade
        for (const month in grades) {
          grades[month] = Math.max(adjustedStartGrade - (90 - grades[month]), 40);
        }
      } else {
        // For neutral performance, fluctuate around the base grade
        grades = generateStableGrades(baseGrade);
      }
      
      monthlyGrades[classId] = grades;
      
      // Add these grades to our class totals for averaging later
      for (const month in grades) {
        classGradeData[classId].totalGrades[month] += grades[month];
        classGradeData[classId].counts[month]++;
      }
    });
    
    // Generate attendance
    const attendance = {};
    assignedClasses.forEach(cls => {
      attendance[cls._id.toString()] = generateAttendance();
    });
    
    // Calculate average year grade across all classes
    let totalAverage = 0;
    let classCount = 0;
    for (const classId in monthlyGrades) {
      totalAverage += calculateAverage(monthlyGrades[classId]);
      classCount++;
    }
    const averageYearGrade = totalAverage / classCount;
    
    // Choose one class for the essay (first assigned class)
    const essayClass = assignedClasses[0];
    const essay = generateEssay(essayClass.name, performanceType);
    
    const newStudent = new Student({
      name,
      age,
      grade,
      classes: studentClasses,
      monthlyGrades: monthlyGrades, // Store as plain object
      attendance: attendance, // Store as plain object
      essay,
      averageYearGrade,
      performanceIndicator: performanceType
    });
    
    const savedStudent = await newStudent.save();
    students.push(savedStudent);
    
    // Add student to each class's students array
    for (const cls of assignedClasses) {
      cls.students.push(savedStudent._id);
      
      // Ensure we don't exceed 10 students per class
      if (cls.students.length > 10) {
        cls.students.shift(); // Remove the oldest student if we exceed 10
      }
      
      await cls.save();
    }
  }
  
  console.log(`Created ${students.length} students`);
  console.log('Sample student:', students[0]);
  
  // Update class effectiveness based on the grade data we collected
  for (const cls of classesCreated) {
    const classId = cls._id.toString();
    const classData = classGradeData[classId];
    
    // Calculate monthly averages
    const monthlyAverages = {};
    for (const month in classData.totalGrades) {
      const count = classData.counts[month];
      monthlyAverages[month] = count > 0 ? classData.totalGrades[month] / count : 0;
    }
    
    // Set monthly averages
    cls.monthlyAverages = monthlyAverages;
    
    // Calculate year average
    const yearAverage = calculateAverage(monthlyAverages);
    cls.yearAverage = yearAverage;
    
    // Set effectiveness
    cls.effectiveness = determineEffectiveness(yearAverage);
    
    await cls.save();
    
    console.log(`Updated class ${cls.name}: yearAverage=${yearAverage.toFixed(2)}, effectiveness=${cls.effectiveness}`);
  }
  
  console.log('Updated classes with effectiveness:', classesCreated.map(c => ({
    id: c._id,
    name: c.name,
    effectiveness: c.effectiveness,
    yearAverage: c.yearAverage,
    students: c.students.length
  })));

  return {
    studentsCreated: students.length,
    classesCreated: classesCreated.length
  };
};

module.exports = {
  generateMockData
};