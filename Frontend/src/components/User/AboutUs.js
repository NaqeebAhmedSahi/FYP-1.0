import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/User/aboutUs.css'; // Ensure to have this CSS file
import Header from "./Header";
import Footer from "./Footer";

// Import team member images (you'll need to add these images to your project)
// These are placeholder imports - replace with your actual image paths
import johnDoe from '../../images/Naqeeb.jpg';
import janeSmith from '../../images/munib.jpg';
import emilyJohnson from '../../images/ahsan.jpg';

const AboutUs = () => {
    return (
        <div className="bg-light">
           <Header/>

            <section className="about">
                <div className="container py-5">
                    <h1 className="text-center display-4 fw-bold mb-4">About Us</h1>
                    <p className="text-center mb-5 lead">
                        At Grapes: NLP Web Craft, we are dedicated to revolutionizing the way you build websites using AI technology.
                    </p>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0">
                                <div className="card-body p-4">
                                    <div className="icon-box bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="bi bi-bullseye fs-4"></i>
                                    </div>
                                    <h5 className="card-title fw-bold">Our Mission</h5>
                                    <p className="card-text">To empower individuals and businesses with innovative web design solutions that enhance creativity and efficiency.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0">
                                <div className="card-body p-4">
                                    <div className="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="bi bi-eye fs-4"></i>
                                    </div>
                                    <h5 className="card-title fw-bold">Our Vision</h5>
                                    <p className="card-text">To be the leading platform in AI-driven web development, enabling seamless creativity and functionality.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0">
                                <div className="card-body p-4">
                                    <div className="icon-box bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="bi bi-heart fs-4"></i>
                                    </div>
                                    <h5 className="card-title fw-bold">Our Values</h5>
                                    <p className="card-text">Innovation, integrity, and collaboration are at the heart of everything we do, ensuring a supportive environment for all.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-center mt-5 mb-4 display-5 fw-bold">Meet Our Team</h2>
                    <p className="text-center mb-5 lead">The passionate people behind our success</p>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0 team-card">
                                <img src={johnDoe} className="card-img-top team-img" alt="John Doe" />
                                <div className="card-body text-center p-4">
                                    <h5 className="card-title fw-bold">Naqeeb Ahmed Sahi</h5>
                                    <p className="card-text text-muted">MERN Stack Developer</p>
                                    <div className="social-links mt-3">
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-twitter"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-linkedin"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-github"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0 team-card">
                                <img src={janeSmith} className="card-img-top team-img" alt="Jane Smith" />
                                <div className="card-body text-center p-4">
                                    <h5 className="card-title fw-bold">Munib Ur Rehman</h5>
                                    <p className="card-text text-muted">Full Stack Developer And Content Writer</p>
                                    <div className="social-links mt-3">
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-twitter"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-linkedin"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-github"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow h-100 border-0 team-card">
                                <img src={emilyJohnson} className="card-img-top team-img" alt="Emily Johnson" />
                                <div className="card-body text-center p-4">
                                    <h5 className="card-title fw-bold">Ahsan Bashir</h5>
                                    <p className="card-text text-muted">Full stuck Developer</p>
                                    <div className="social-links mt-3">
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-twitter"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-linkedin"></i></a>
                                        <a href="#" className="text-decoration-none mx-2"><i className="bi bi-github"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>
        </div>
    );
};

export default AboutUs;