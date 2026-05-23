const LogoutModal = ({ onClose, onLogout }) => {
  return (
    <div className="logout-overlay">

      <div className="logout-modal">

        <h2>Confirm Logout</h2>

        <p>
          Are you sure you want to logout?
        </p>

        <div className="logout-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
};

export default LogoutModal;