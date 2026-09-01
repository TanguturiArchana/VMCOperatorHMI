import "./JobHeader.css";
function JobSelection({ jobs, onSelectJob }) {
  return (
    <div>

      {jobs.map((job) => (
        <div className="job-header" key={job.id}>
        <table>
        <tbody>
          <tr>
            <th>Part</th>
            <td>{job.part_name}</td>
          </tr>

          <tr>
            <th>Quantity</th>
            <td>{job.quantity}</td>
          </tr>

          <tr>
            <th>Material</th>
            <td>{job.material}</td>
          </tr>

          <tr>
            <th>Drawing</th>
            <td>{job.drawing_revision}</td>
          </tr>
        </tbody>
      </table>

          <button onClick={() => onSelectJob(job)}>
            Select Job
          </button>
        </div>
      ))}
    </div>
  );
}




export default JobSelection;


