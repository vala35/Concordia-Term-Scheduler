// frontend/src/App.js
import React, {useState} from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [subject, setSubject] = useState('');
    const [termCode, setTermCode] = useState('');
    const [courses, setCourses] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [desc, setDesc] = useState(true);
    const [prereq, setPrereq] = useState(true);
    const subjectList = ["COMP", "SOEN", "ENCS", "ENGR", "MATH", "MAST", "PHYS", "LING", "ECON", "RELI", "INST", "MANA", "COMM",
        "BIOL", "ACCO", "URBS", "EDUC", "HIST", "ENGL", "POLI", "PSYC", "FINA", "FMST", "ANTH", "SOCI", "PHIL", "JOUR", "CHEM", "AHSC",
        "GEOG", "EXCI", "LOYC", "MARK", "AERO", "MIAE", "MECH", "INDU", "BTM", "COEN", "ELEC", "BCEE", "BLDG", "CIVI", "STAT", "FRAN"].sort();
    const academicYr = 2025;
    const referenceYr = Number(academicYr.toString().substring(0, 1) + academicYr.toString().substring(2));
    const fetchCourses = async () => {
        setLoading(true);
        setCourses([]);
        try {
            const subjectStr = subject.trim() === '' ? '*' : subject;
            const response = await axios.get(`/api/courses/${subjectStr}/${termCode}`);
            let sortedCourses = response.data.sort((a, b) => {
                if (a.subject !== b.subject) {
                    return a.subject.localeCompare(b.subject);
                }
                if (a.catalog !== b.catalog) {
                    return a.catalog.localeCompare(b.catalog);
                }
                return a.section.localeCompare(b.section);
            });

            sortedCourses = await addAdditionalCourseData(sortedCourses);

            setCourses(sortedCourses);
        } catch (error) {
            console.error(error);
            alert('Error fetching courses. Please make sure a term is selected.');
        }
        setLoading(false);
    };

    const addAdditionalCourseData = async (data) => {
        try {
            const subjectStr = subject.trim();
            const response = await axios.get(`/api/information/${subjectStr}/`);

            let matches = data.map(main => {
                    const match = response.data.find(sub => main.courseID === sub.ID);
                    return {...main, ...match};
                }).filter(Boolean);

            return matches;
        } catch (error) {
            console.error(error);
            alert('Error fetching courses. Please make sure a term is selected.');
            throw error;
        }
    }

    const addToSchedule = (course) => {
        setSchedule([...schedule, course]);
    };

    const getDays = (course) => {
        const days = [{key: 'modays', label: 'Monday'}, {key: 'tuesdays', label: 'Tuesday'}, {key: 'wednesdays', label: 'Wednesday'}, {key: 'thursdays', label: 'Thursday'}, {key: 'fridays', label: 'Friday'}, {
            key: 'saturdays',
            label: 'Saturday'
        }, {key: 'sundays', label: 'Sunday'},];

        // Filter and return days where the value is "Y"
        return days
            .filter((day) => course[day.key] === 'Y')
            .map((day) => day.label)
            .join(', ');
    };


    const getTimes = (course) => {
        const pureStart = course.classStartTime;
        const pureEnd = course.classEndTime;

        if (pureStart === "00.00.00") return "Online/Asynchronous";
        return pureStart.substring(0, 5).replaceAll(".",":") + " - " + pureEnd.substring(0, 5).replaceAll(".",":");

    }

    const getTerm = (course) => {
        const yr = course.termCode.substring(0, 1) + 0 + course.termCode.substring(1, 3);

        const startDate = new Date(course.classStartDate.substring(6), Number(course.classStartDate.substring(3, 5)) - 1, course.classStartDate.substring(0, 2));
        const endDate = new Date(course.classEndDate.substring(6), Number(course.classEndDate.substring(3, 5)) - 1, course.classEndDate.substring(0, 2));

        const length = () => {
            switch (course.session) {
                case "6H1":
                    return "First Half";
                case "6H2":
                    return "Second Half";
                case "13W":
                    return "Full Term";
                default:
                    return "Unknown";
            }
        }

        switch (course.termCode.at(3)) {
            case "1":
                return "Summer " + yr + " - " + length() + " (" + startDate.toDateString() + " - " + endDate.toDateString() + ")";
            case "2":
                return "Fall " + yr;
            case "3":
                return "Fall-Winter " + yr + "-" + (Number(yr) + 1);
            case "4":
                return "Winter " + (Number(yr) + 1);
            default:
                return "---"
        }
    }


    return (<div style={{padding: '20px'}}>
        <h1>Concordia Course Scheduler</h1>
        <p>This tool is designed to find Concordia's course offerings for any given term using historical data.
            <br/> Targeted towards Co-op students looking to clarify or reorganize their sequence.
            <br/> Concordia University's OpenData API makes this possible, however, this tool has <b>no direct
                affiliation</b> with Concordia University.
            <br/> For more information, please visit Concordia's <a
                href="https://www.concordia.ca/it/services/opendata.html" target="_blank"> OpenData Page</a> {" "}
            and <a href={"https://github.com/opendataConcordiaU/documentation/tree/master?tab=readme-ov-file"}
                   target={"_blank"}> GitHub Repository</a>.
            <br/><b>Use at your own risk. A course offered in a previous term may not be offered in the same term
                next year.</b>
            <br/><a href="change-list.txt" target="_blank">Incoming Changes</a>
            <br/><a href="known-issues.txt" target="_blank">Known Issues</a>
            <br/>You <b>must</b> select a term.
        </p>

        <div>
            <div className="selections">
                <select
                    id="subject"
                    onChange={(e) => setSubject(e.target.value)}
                >
                    <option value="">Select a Subject</option>
                    {subjectList.map(subj => (<option value={subj}>{subj}</option>))}
                </select>
                <select
                    id="term"
                    onChange={(e) => setTermCode(e.target.value)}
                >
                    <option value="">Select a Term</option>
                    <option value={referenceYr + "1"}>{"Summer " + academicYr}</option>
                    <option value={referenceYr + "2"}>{"Fall " + academicYr}</option>
                    <option value={referenceYr + "3"}>{"Fall-Winter " + academicYr}</option>
                    <option value={referenceYr + "4"}>{"Winter " + (academicYr + 1)}</option>
                </select>
                {/*<input className={"checkbox"} type={"checkbox"} id={"coursePrereq"} name={"coursePrereq"} onChange={(e) => setPrereq(e.target.checked)}/>*/}
                {/*<label className={"checkboxLabel"} htmlFor={"coursePrereq"}>Get credit & prerequisite info (added loading time)</label>*/}
                {/*<br/>*/}
                {/*<input className={"checkbox"} type={"checkbox"} id={"courseDesc"} name={"courseDesc"} onChange={(e) => setDesc(e.target.checked)}/>*/}
                {/*<label className={"checkboxLabel"} htmlFor={"courseDesc"}>Get full course descriptions (added loading time)</label>*/}
                {/*<br/>*/}
            </div>
            <button id="fetchButton" onClick={fetchCourses}>Fetch Courses</button>

            {loading && (<>
                <div className="loader"></div>
            </>)}
        </div>
        {courses.length !== 0 && (<>
            <h2>Available Courses</h2>
        </>)}

        <ul className="courseList">
            {courses.map((course) => (<>
                {course.componentDescription !== "Laboratory" && course.componentDescription !== "Tutorial" ? (<>
                    <li key={course.classNumber} className="mainCourse">
                        <strong>{course.subject} {course.catalog} - </strong> {course.section} ({course.componentDescription})
                        <br/>
                        {course.title}
                        <br/>
                        {course.classUnit + " credits"}
                        <br/>
                        <b>Days:</b> {getDays(course)}
                        <br/>
                        <b>Time:</b> {getTimes(course)}
                        <br/>
                        <b>Term:</b> {getTerm(course)}
                        <br/>
                        <b>Location:</b> {course.locationCode}
                        <br/>
                        <b>Prerequisites:</b> {course.prerequisites.trim()==="" ? "None" : course.prerequisites.trim()}
                    </li>
                </>) : (<>
                    <li key={course.classNumber} className="subCourse">
                        {course.section} ({course.componentDescription})
                        <br/>
                        <b>Days:</b> {getDays(course)}
                        <br/>
                        <b>Time:</b> {getTimes(course)}
                        <br/>
                        <b>Location:</b> {course.locationCode}
                    </li>

                </>)}
                <br/>
            </>))}
        </ul>

    </div>);
}

export default App;
