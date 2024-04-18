import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Redirect() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_GITHUB_SECRET;

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      };

      fetch("http://localhost:8080/oauth/callback", requestOptions)
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            fetch(`http://localhost:8080/oauth/user/${data.access_token}`)
              .then((res) => res.json())
              .then((secondData) => {
                const reqBody = {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: secondData.name,
                    email: secondData.email,
                    provider: "github",
                    uid: secondData.id,
                  }),
                };

                fetch("https://tddah-be-39c5a52e8b65.herokuapp.com/api/v1/users", reqBody)
                  .then((res) => res.json())
                  .then((data) => {
                    console.log(data);
                    navigate("/home");
                  })
                  .catch((thirdErr) => {
                    setError("Error processing user data.");
                  });
              })
              .catch((secondErr) => {
                setError("Error fetching user data from GitHub.");
              });
          } else {
            setError("No access token received.");
          }
        })
        .catch((err) => {
          setError("Error during authentication.");
        });
    }
  }, [navigate]);

  return (
    <div>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div>Redirecting...</div>
      )}
    </div>
  );
}

export default Redirect;
