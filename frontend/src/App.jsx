import { useEffect, useState } from "react";
import "./App.css";


import JobHeader from "./components/JobHeader";
import JobSelection from "./components/JobSelection";
import Workpiece from "./components/WP";
import Tools from "./components/Tools";
import ReadyReview from "./components/ReadyReview";
import MachineChecks from "./components/MachineChecks";
import Operation from "./components/Operation";


function App() {
  const [machinePoweredOn, setMachinePoweredOn] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentStage, setCurrentStage] = useState("JOB_SELECTION");
  const [machineChecks, setMachineChecks] = useState([]);
  const [tools, setTools] = useState([]);
  const [workpieceChecks, setWorkpieceChecks] = useState([]);
  const [operationStatus, setOperationStatus] = useState("STOPPED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  
  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not load jobs");
        setLoading(false);
      });
  }, []);

  const handlePowerOn = () => {
  setMachinePoweredOn(true);
  setCurrentStage("MACHINE_CHECKS");
};

  

  const selectJob = async (job) => {
    try {
      setError("");
      setSelectedJob(job);
      setMachinePoweredOn(false);
      const machineResponse = await fetch(
        `http://localhost:5000/api/jobs/${job.id}/machine-checks`
      );

      if (!machineResponse.ok) {
        throw new Error("Failed to fetch machine checks");
      }
      const machineData = await machineResponse.json();
      setMachineChecks(machineData);


      const toolsResponse = await fetch(
        `http://localhost:5000/api/jobs/${job.id}/tools`
      );

      if (!toolsResponse.ok) {
        throw new Error("Failed to fetch tools");
      }

      const toolsData = await toolsResponse.json();
      setTools(toolsData);

     
      const workpieceResponse = await fetch(
        `http://localhost:5000/api/jobs/${job.id}/workpiece-checks`
      );
      if (!workpieceResponse.ok) {
        throw new Error("Failed to fetch workpiece checks");
      }
      const workpieceData = await workpieceResponse.json();
      setWorkpieceChecks(workpieceData);

    
      const stateResponse = await fetch(
        `http://localhost:5000/api/jobs/${job.id}/state`
      );
      if (stateResponse.ok) {
        const stateData = await stateResponse.json();

        setCurrentStage(stateData.current_stage);

        if (stateData.operation_status) {
          setOperationStatus(stateData.operation_status);
        }
      } else {
        setCurrentStage("MACHINE_CHECKS");
      }
    } catch (error) {
      console.error(error);
      setError("Could not load job information");
    }
  };

 
  const handleMachineCheckChange = async (check) => {
    try {
      const newValue = check.completed === 1 ? 0 : 1;

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJob.id}/machine-checks/${check.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update machine check");
      }

      setMachineChecks((currentChecks) =>
        currentChecks.map((item) =>
          item.id === check.id
            ? { ...item, completed: newValue }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("Could not update machine check");
    }
  };



  const handleToolChange = async (tool) => {
    try {
      const newValue = tool.confirmed === 1 ? 0 : 1;

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJob.id}/tools/${tool.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmed: newValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tool");
      }

      setTools((currentTools) =>
        currentTools.map((item) =>
          item.id === tool.id
            ? { ...item, confirmed: newValue }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("Could not update tool");
    }
  };

  
  const handleWorkpieceCheckChange = async (check) => {
    try {
      const newValue = check.completed === 1 ? 0 : 1;

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJob.id}/workpiece-checks/${check.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update workpiece check");
      }

      setWorkpieceChecks((currentChecks) =>
        currentChecks.map((item) =>
          item.id === check.id
            ? { ...item, completed: newValue }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("Could not update workpiece check");
    }
  };


 
  const handleNext = async () => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJob.id}/next`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      console.log("Next stage:", data);

      setCurrentStage(data.current_stage);
    } catch (error) {
      console.error(error);
      setError("Could not move to next stage");
    }
  };

  const handleStop = async () => {
  try {
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/jobs/${selectedJob.id}/stop`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    setOperationStatus(data.operation_status);
  } catch (error) {
    console.error(error);
    setError("Could not stop operation");
  }
};

const handleStart = async () => {
  try {
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/jobs/${selectedJob.id}/start`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    setOperationStatus(data.operation_status);
  } catch (error) {
    console.error(error);
    setError("Could not start operation");
  }
};


const handleRestart = async () => {
  try {
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/jobs/${selectedJob.id}/restart`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }
    setCurrentStage(data.current_stage);
    setOperationStatus(data.operation_status);
    setMachineChecks((checks) =>
      checks.map((check) => ({
        ...check,
        completed: 0,
      }))
    );
    setTools((tools) =>
      tools.map((tool) => ({
        ...tool,
        confirmed: 0,
      }))
    );
    setWorkpieceChecks((checks) =>
      checks.map((check) => ({
        ...check,
        completed: 0,
      }))
    );

  } catch (error) {
    console.error(error);
    setError("Could not restart job");
  }
};

  

  if (loading) {
    return <h2>Loading jobs...</h2>;
  }

  

  if (error) {
    return <h2>{error}</h2>;
  }

 

  if (!selectedJob) {
    return (
      <div className="app">
        <h1>VMC Operator HMI</h1>

        <JobSelection
          jobs={jobs}
          onSelectJob={selectJob}
        />
      </div>
    );
  }

 if (!machinePoweredOn) {
  return (
    <div className="app">
      <h1>VMC Operator HMI</h1>

      <JobHeader job={selectedJob} />

      <div className="power-on-panel">
        <h2>Machine Power</h2>

        <div className="power-status">
          POWER OFF
        </div>

        <p>
          Power on the VMC machine to begin the startup procedure.
        </p>

        <button
          className="power-on-button"
          onClick={handlePowerOn}
        >
          POWER ON
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="app">
      <h1>VMC Operator HMI</h1>

      <JobHeader job={selectedJob} />

      <hr />
      {currentStage === "MACHINE_CHECKS" && (
        <MachineChecks
          selectedJob={selectedJob}
          machineChecks={machineChecks}
          onCheckChange={handleMachineCheckChange}
          onNext={handleNext}
        />
      )}

      {currentStage === "TOOLS" && (
        <Tools
          tools={tools}
          onToolChange={handleToolChange}
          onNext={handleNext}
        />
      )}

      {currentStage === "WORKPIECE" && (
        <Workpiece
          workpieceChecks={workpieceChecks}
          onCheckChange={handleWorkpieceCheckChange}
          onNext={handleNext}
        />
      )}
      {currentStage === "READY_REVIEW" && (
        <ReadyReview
          onNext={handleNext}
        />
      )}

      {currentStage === "OPERATION" && (
        <Operation
          operationStatus={operationStatus}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;