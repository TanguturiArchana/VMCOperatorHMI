import "./Operation.css";
function Operation({
  operationStatus,
  onStart,
  onStop,
  onRestart,
}) {
  return (
    <div className="operation">

      <h2>Operation</h2>

      <div className="operation-status">
        Status: {operationStatus}
      </div>

      <div className="operation-controls">

        <button
          className="start-button"
          onClick={onStart}
          disabled={operationStatus === "RUNNING"}
        >
          START
        </button>

        <button
          className="stop-button"
          onClick={onStop}
          disabled={operationStatus !== "RUNNING"}
        >
          STOP
        </button>

      </div>

      <hr />

      <button
        className="restart-button"
        onClick={() => {
          const confirmed = window.confirm(
            "Are you sure you want to start this job again?\n\n" +
            "All machine checks, tool confirmations, and workpiece checks will be reset."
          );

          if (confirmed) {
            onRestart();
          }
        }}
      >
        START AGAIN
      </button>

    </div>
  );
}

export default Operation;