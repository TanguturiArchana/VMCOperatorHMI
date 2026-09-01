import './MachineChecks.css';
function Tools({ tools, onToolChange, onNext }) {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Required Tools</h2>

      {tools.map((tool) => (
        <div className="check-item" key={tool.id}>
          <label>
            <input
              type="checkbox"
              checked={tool.confirmed === 1}
              onChange={() => onToolChange(tool)}
            />

            {tool.tool_name}
          </label>
        </div>
      ))}

      <button className="next-button" onClick={onNext}>
        NEXT →
      </button>
    </div>
  );
}

export default Tools;