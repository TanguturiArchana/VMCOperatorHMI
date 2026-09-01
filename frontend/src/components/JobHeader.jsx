import "./JobHeader.css";

function JobHeader({ job }) {
  return (
    <div className="job-header">
      <h2>{job.job_number}</h2>

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
    </div>
  );
}

export default JobHeader;