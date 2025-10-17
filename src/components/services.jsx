import React from "react";

export const Services = (props) => {
  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Our Services</h2>
          <p className="section-subtitle">
            Comprehensive solutions tailored to elevate your business
          </p>
        </div>
        <div className="row services-grid">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4 col-sm-6">
                  <div className="service-card">
                    <div className="service-icon-wrapper">
                      <i className={d.icon}></i>
                    </div>
                    <div className="service-content">
                      <h3>{d.name}</h3>
                      <p>{d.text}</p>
                    </div>
                    <div className="service-hover-overlay"></div>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};
