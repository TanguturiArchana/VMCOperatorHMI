import { FaCheckCircle } from "react-icons/fa";
import "./ReadyReview.css";

function ReadyReview({ onNext }) {
  return (
    <div className="ready-review">
      <h2>Ready Review</h2>

      <div className="ready-status">
        READY
      </div>

      <div className="review-item">
        <FaCheckCircle className="check-icon" />
        <span>Machine checks completed</span>
      </div>

      <div className="review-item">
        <FaCheckCircle className="check-icon" />
        <span>Required tools confirmed</span>
      </div>

      <div className="review-item">
        <FaCheckCircle className="check-icon" />
        <span>Workpiece setup completed</span>
      </div>

      <button className="next-button" onClick={onNext}>
        START OPERATION →
      </button>
    </div>
  );
}

export default ReadyReview;