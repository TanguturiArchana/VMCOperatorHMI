import './MachineChecks.css';
function MachineChecks({
  selectedJob,
  machineChecks,
  onCheckChange,
  onNext,
}) {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Machine Checks</h2>

      {machineChecks.map((check) => (
        <div className="check-item" key={check.id}>
          <label>
            <input
              type="checkbox"
              checked={check.completed === 1}
              onChange={() => onCheckChange(check)}
            />

            {check.check_name}
          </label>
        </div>
      ))}

      <button className="next-button" onClick={onNext}>
        NEXT →
      </button>
    </div>
  );
}

export default MachineChecks;