require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT   || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "VMC HMI Backend is running!"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      message: "MySQL connected successfully!",
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});
app.get("/api/jobs", async (req, res) => {
  try {
    const [jobs] = await db.query("SELECT * FROM jobs");

    res.json(jobs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
});
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE id = ?",
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch job",
      error: error.message
    });
  }
});
app.get("/api/jobs/:id/tools", async (req, res) => {
  try {
    const { id } = req.params;

    const [tools] = await db.query(
      "SELECT * FROM tools WHERE job_id = ?",
      [id]
    );

    res.json(tools);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tools",
      error: error.message
    });
  }
});
app.get("/api/jobs/:id/machine-checks", async (req, res) => {
  try {
    const { id } = req.params;

    const [checks] = await db.query(
      "SELECT * FROM machine_checks WHERE job_id = ?",
      [id]
    );

    res.json(checks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch machine checks",
      error: error.message
    });
  }
});
app.get("/api/jobs/:id/workpiece-checks", async (req, res) => {
  try {
    const { id } = req.params;

    const [checks] = await db.query(
      "SELECT * FROM workpiece_checks WHERE job_id = ?",
      [id]
    );

    res.json(checks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch workpiece checks",
      error: error.message
    });
  }
});
app.put("/api/jobs/:jobId/machine-checks/:checkId", async (req, res) => {
  try {
    const { jobId, checkId } = req.params;
    const { completed } = req.body;

    const [result] = await db.query(
      `UPDATE machine_checks
       SET completed = ?
       WHERE id = ?
       AND job_id = ?`,
      [completed, checkId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Machine check not found for this job"
      });
    }

    res.json({
      message: "Machine check updated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update machine check",
      error: error.message
    });
  }
});
app.put("/api/jobs/:jobId/tools/:toolId", async (req, res) => {
  try {
    const { jobId, toolId } = req.params;
    const { confirmed } = req.body;

    const [result] = await db.query(
      `UPDATE tools
       SET confirmed = ?
       WHERE id = ?
       AND job_id = ?`,
      [confirmed, toolId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Tool not found for this job"
      });
    }

    res.json({
      message: "Tool updated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update tool",
      error: error.message
    });
  }
});
app.put("/api/jobs/:jobId/workpiece-checks/:checkId", async (req, res) => {
  try {
    const { jobId, checkId } = req.params;
    const { completed } = req.body;

    const [result] = await db.query(
      `UPDATE workpiece_checks
       SET completed = ?
       WHERE id = ?
       AND job_id = ?`,
      [completed, checkId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Workpiece check not found for this job"
      });
    }

    res.json({
      message: "Workpiece check updated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update workpiece check",
      error: error.message
    });
  }
});
app.post("/api/jobs/:jobId/next", async (req, res) => {
  try {
    const { jobId } = req.params;

    const [states] = await db.query(
      "SELECT * FROM job_state WHERE job_id = ?",
      [jobId]
    );

    if (states.length === 0) {
      return res.status(404).json({
        message: "Job state not found"
      });
    }

    const currentStage = states[0].current_stage;

 
    if (currentStage === "MACHINE_CHECKS") {
      const [checks] = await db.query(
        "SELECT * FROM machine_checks WHERE job_id = ?",
        [jobId]
      );

      const allComplete = checks.length > 0 &&
        checks.every(check => check.completed === 1);

      if (!allComplete) {
        return res.status(400).json({
          message: "Complete all machine checks before continuing"
        });
      }

      await db.query(
        "UPDATE job_state SET current_stage = ? WHERE job_id = ?",
        ["TOOLS", jobId]
      );

      return res.json({
        message: "Moved to TOOLS stage",
        current_stage: "TOOLS"
      });
    }

    if (currentStage === "TOOLS") {
      const [tools] = await db.query(
        "SELECT * FROM tools WHERE job_id = ?",
        [jobId]
      );

      const allConfirmed = tools.length > 0 &&
        tools.every(tool => tool.confirmed === 1);

      if (!allConfirmed) {
        return res.status(400).json({
          message: "Confirm all required tools before continuing"
        });
      }

      await db.query(
        "UPDATE job_state SET current_stage = ? WHERE job_id = ?",
        ["WORKPIECE", jobId]
      );

      return res.json({
        message: "Moved to WORKPIECE stage",
        current_stage: "WORKPIECE"
      });
    }

    
    if (currentStage === "WORKPIECE") {
      const [checks] = await db.query(
        "SELECT * FROM workpiece_checks WHERE job_id = ?",
        [jobId]
      );

      const allComplete = checks.length > 0 &&
        checks.every(check => check.completed === 1);

      if (!allComplete) {
        return res.status(400).json({
          message: "Complete all workpiece checks before continuing"
        });
      }

      await db.query(
        "UPDATE job_state SET current_stage = ? WHERE job_id = ?",
        ["READY_REVIEW", jobId]
      );

      return res.json({
        message: "Moved to READY REVIEW stage",
        current_stage: "READY_REVIEW"
      });
    }
    if (currentStage === "READY_REVIEW") {
      await db.query(
        `UPDATE job_state
         SET current_stage = ?,
         operation_status = ?
         WHERE job_id = ?`,
        ["OPERATION", "READY", jobId]
       );

       return res.json({
            message: "Job is ready for operation",
            current_stage: "OPERATION",
            operation_status: "READY"
        });
     }

    if (currentStage === "OPERATION") {
      return res.status(400).json({
        message: "Job is already in the operation stage"
      });
    }

    return res.status(400).json({
      message: "Unknown job stage"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to move to next stage",
      error: error.message
    });
  }
});
app.post("/api/jobs/:jobId/start", async (req, res) => {
  try {
    const { jobId } = req.params;

    const [states] = await db.query(
      "SELECT * FROM job_state WHERE job_id = ?",
      [jobId]
    );

    if (states.length === 0) {
      return res.status(404).json({
        message: "Job state not found"
      });
    }

    if (states[0].current_stage !== "OPERATION") {
      return res.status(400).json({
        message: "Job is not ready for operation"
      });
    }

    if (states[0].operation_status === "RUNNING") {
      return res.status(400).json({
        message: "Operation is already running"
      });
    }

    await db.query(
      "UPDATE job_state SET operation_status = ? WHERE job_id = ?",
      ["RUNNING", jobId]
    );

    res.json({
      message: "Operation started",
      operation_status: "RUNNING"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to start operation",
      error: error.message
    });
  }
});
app.post("/api/jobs/:jobId/stop", async (req, res) => {
  try {
    const { jobId } = req.params;

    const [states] = await db.query(
      "SELECT * FROM job_state WHERE job_id = ?",
      [jobId]
    );

    if (states.length === 0) {
      return res.status(404).json({
        message: "Job state not found"
      });
    }

    if (states[0].operation_status !== "RUNNING") {
      return res.status(400).json({
        message: "Operation is not currently running"
      });
    }

    await db.query(
      "UPDATE job_state SET operation_status = ? WHERE job_id = ?",
      ["STOPPED", jobId]
    );

    res.json({
      message: "Operation stopped",
      operation_status: "STOPPED"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to stop operation",
      error: error.message
    });
  }
});
app.post("/api/jobs/:jobId/restart", async (req, res) => {
  try {
    const { jobId } = req.params;
    await db.query(
      `UPDATE machine_checks
       SET completed = 0
       WHERE job_id = ?`,
      [jobId]
    );

    
    await db.query(
      `UPDATE tools
       SET confirmed = 0
       WHERE job_id = ?`,
      [jobId]
    );

  
    await db.query(
      `UPDATE workpiece_checks
       SET completed = 0
       WHERE job_id = ?`,
      [jobId]
    );

 
    await db.query(
      `UPDATE job_state
       SET current_stage = 'MACHINE_CHECKS',
           operation_status = 'STOPPED'
       WHERE job_id = ?`,
      [jobId]
    );

    res.json({
      message: "Job restarted successfully",
      current_stage: "MACHINE_CHECKS",
      operation_status: "STOPPED"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to restart job",
      error: error.message
    });
  }
});


app.get("/api/jobs/:id/state", async (req, res) => {
  try {
    const { id } = req.params;

    const [states] = await db.query(
      "SELECT * FROM job_state WHERE job_id = ?",
      [id]
    );

    if (states.length === 0) {
      return res.status(404).json({
        message: "Job state not found"
      });
    }

    res.json(states[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch job state",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
