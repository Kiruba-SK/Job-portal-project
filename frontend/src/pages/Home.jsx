import React, { useState } from "react";
import Navbar from "../components/Navbar";
import RecruiterLogin from "../components/RecruiterLogin";
import Hero from "../components/Hero";
import JobListing from "../components/JobListing";
import AppDownload from "../components/AppDownload";
import Footer from "../components/Footer";

const Home = () => {
  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);

  const handleSearch = (newSearch) => {
    setSearchFilter(newSearch);
    setIsSearched(true);
  };

  const handleClearFilter = (field) => {
    setSearchFilter((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div>
      <Navbar onShowRecruiterLogin={() => setShowRecruiterLogin(true)} />
      <Hero onSearch={handleSearch} />
      <JobListing
        searchFilter={searchFilter}
        isSearched={isSearched}
        onClearFilter={handleClearFilter}
      />
      <AppDownload />
      <Footer />
      {showRecruiterLogin && (
        <RecruiterLogin onClose={() => setShowRecruiterLogin(false)} />
      )}
    </div>
  );
};

export default Home;
