"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  useResumeStore,
  useResumes,
  useResumeLoading,
  useResumeError,
  extractPlainText,
  extractTitleText,
  extractSelect,
  extractPhoneNumber,
  extractMultiSelect,
  extractNumber,
} from "@/store/resumeStore";
import { RawNotionResume } from "@/types/notion_database";
import { useCurrentUserRole } from "@/store/userStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { maskEmail, maskPhone } from "@/lib/utils";

function FindChefPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [professionFilter, setProfessionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 chefs per page (4 rows of 3)
  const [selectedResume, setSelectedResume] = useState<RawNotionResume | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const userRole = useCurrentUserRole();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setExperienceFilter("all");
    setProfessionFilter("all");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Resume store hooks
  const resumes = useResumes();
  const isLoadingResumes = useResumeLoading();
  const resumeError = useResumeError();
  const { fetchChefResumes } = useResumeStore();

  // Handle card click - only for pro users
  const handleCardClick = (resume: RawNotionResume) => {
    if (userRole === "pro") {
      setSelectedResume(resume);
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResume(null);
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.info("Login required to search chefs", {
        description: "Please sign in to access the chef search functionality.",
        action: {
          label: "Login",
          onClick: () => {
            // This will be handled by the SignInButton
          },
        },
        duration: 5000,
        closeButton: true,
      });
    }
  }, [isSignedIn, isLoaded]);

  // Fetch resumes when user is signed in
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetchChefResumes();
    }
  }, [isSignedIn, isLoaded, fetchChefResumes]);

  const filteredChefs = useMemo(() => {
    return resumes.filter((resume) => {
      const name = extractPlainText(resume.properties.name);
      const email = extractTitleText(resume.properties.email);
      const phone = extractPhoneNumber(resume.properties.mobile);
      const totalExperience = extractNumber(resume.properties.experience);
      const jobType = extractSelect(resume.properties.profession);

      // Search term filter - search on original unmasked data
      const matchesSearch =
        !searchTerm ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        totalExperience.toString().includes(searchTerm.toLowerCase()) ||
        (jobType &&
          jobType.toLowerCase().includes(searchTerm.toLowerCase()));

      // Experience filter
      let matchesExperience = true;
      if (experienceFilter && experienceFilter !== "all") {
        switch (experienceFilter) {
          case "fresher":
            matchesExperience = totalExperience < 3;
            break;
          case "medium":
            matchesExperience = totalExperience >= 3 && totalExperience <= 6;
            break;
          case "high":
            matchesExperience = totalExperience > 6 && totalExperience <= 10;
            break;
          case "pro":
            matchesExperience = totalExperience > 10;
            break;
        }
      }

      // Profession filter (using profession)
      const matchesProfession =
        !professionFilter ||
        professionFilter === "all" ||
        jobType === professionFilter;

      return matchesSearch && matchesExperience && matchesProfession;
    });
  }, [searchTerm, experienceFilter, professionFilter, resumes]);

  // Pagination logic
  const totalPages = Math.ceil(filteredChefs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChefs = filteredChefs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, experienceFilter, professionFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first page
      items.push(1);

      if (currentPage > 3) {
        items.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        items.push("ellipsis-end");
      }

      // Show last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  };

  // Get unique job types from the data
  const uniqueProfessions = useMemo(() => {
    const jobTypes = new Set<string>();
    resumes.forEach((resume) => {
      const jobType = extractSelect(resume.properties.profession);
      if (jobType) {
        jobTypes.add(jobType);
      }
    });
    return Array.from(jobTypes).sort();
  }, [resumes]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-white">
        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative bg-gray-800 text-white py-32 text-center">
            <div className="absolute inset-0">
              <Image
                src="https://images.pexels.com/photos/592815/pexels-photo-592815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Assortment of spices"
                layout="fill"
                objectFit="cover"
                className="opacity-40"
              />
            </div>
            <div className="relative max-w-4xl mx-auto px-4">
              <h1 className="text-5xl font-bold mb-4">Find Your Next Chef</h1>
              <p className="text-xl text-gray-200 mb-8">
                Browse our network of talented culinary professionals.
              </p>

              {/* Login Required Message */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Login Required
                </h2>
                <p className="text-lg mb-6 text-gray-200">
                  Please sign in to access our chef search and browse available
                  culinary professionals.
                </p>
                <SignInButton mode="modal">
                  <button className="bg-orange-500 text-white px-8 py-4 rounded-md hover:bg-orange-600 transition-colors font-medium text-lg">
                    Sign In to Search Chefs
                  </button>
                </SignInButton>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Chef Network?
              </h2>
              <p className="text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
                Our platform connects you with verified, experienced chefs from
                across the country. Each chef has been carefully vetted to
                ensure quality and reliability.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-3">Verified Profiles</h3>
                  <p className="text-gray-600">
                    All chefs are verified with background checks and experience
                    validation.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl mb-4">📞</div>
                  <h3 className="text-xl font-bold mb-3">Direct Contact</h3>
                  <p className="text-gray-600">
                    Connect directly with chefs through our secure messaging
                    system.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-xl font-bold mb-3">Quality Assured</h3>
                  <p className="text-gray-600">
                    Only the best chefs with proven track records are featured.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Show full content when signed in
  return (
    <div className="bg-white">
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gray-800 text-white py-32 text-center">
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/592815/pexels-photo-592815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Assortment of spices"
              layout="fill"
              objectFit="cover"
              className="opacity-40"
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">Find Your Next Chef</h1>
            <p className="text-xl text-gray-200 mb-4">
              Browse our network of talented culinary professionals.
            </p>
            {userRole === "basic" && (
              <div className="bg-orange-500/20 backdrop-blur-md rounded-lg p-4 border border-orange-300/30">
                <p className="text-orange-100 text-sm">
                  <strong>Basic Plan:</strong> Limited information displayed.
                  <span className="ml-2">
                    <a
                      href="/upgrade"
                      className="underline hover:text-white transition-colors"
                    >
                      Upgrade to Pro
                    </a>{" "}
                    to see full details and contact information.
                  </span>
                </p>
              </div>
            )}
            {userRole === "pro" && (
              <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-4 border border-green-300/30">
                <p className="text-green-100 text-sm">
                  <strong>Pro Plan:</strong> Full access to all details and contact information.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {/* Search Input */}
              <Input
                type="text"
                placeholder="Search by name, email, phone, experience, or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-lg p-6 rounded-md border-gray-300"
              />

              {/* Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Experience Filter */}
                <div className="flex-1">
                  <Select
                    value={experienceFilter}
                    onValueChange={setExperienceFilter}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Filter by experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience Levels</SelectItem>
                      <SelectItem value="fresher">
                        Fresher (Less than 3 years)
                      </SelectItem>
                      <SelectItem value="medium">Medium (3-6 years)</SelectItem>
                      <SelectItem value="high">High (6-10 years)</SelectItem>
                      <SelectItem value="pro">
                        Pro (More than 10 years)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profession Filter */}
                <div className="flex-1">
                  <Select
                    value={professionFilter}
                    onValueChange={setProfessionFilter}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Filter by profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Professions</SelectItem>
                      {uniqueProfessions.map((profession) => (
                        <SelectItem key={profession} value={profession}>
                          {profession}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm ||
                  experienceFilter !== "all" ||
                  professionFilter !== "all") && (
                  <div className="flex items-end">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="h-12 px-6"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {isLoadingResumes && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resumes...</p>
            </div>
          </section>
        )}

        {/* Error State */}
        {resumeError && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-red-600">
                Error loading resumes: {resumeError}
              </p>
            </div>
          </section>
        )}

        {/* Chefs Grid */}
        {!isLoadingResumes && !resumeError && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Count */}
              <div className="mb-8">
                <p className="text-gray-600 text-lg">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredChefs.length)} of{" "}
                  {filteredChefs.length} chefs
                  {(searchTerm ||
                    experienceFilter !== "all" ||
                    professionFilter !== "all") && (
                    <span className="text-gray-500"> (filtered)</span>
                  )}
                  {totalPages > 1 && (
                    <span className="text-gray-500">
                      {" "}
                      • Page {currentPage} of {totalPages}
                    </span>
                  )}
                </p>
              </div>

              {currentChefs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No chefs found matching your search criteria.
                  </p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="initial"
                  animate="animate"
                  variants={{
                    animate: {
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                >
                  {currentChefs.map((resume, index) => {
                    // Extract data using helper functions
                    const name = extractPlainText(resume.properties.name);
                    const email = extractTitleText(resume.properties.email);
                    const phone = extractPhoneNumber(resume.properties.mobile);
                    const location = extractPlainText(resume.properties.location);
                    const totalExperience = extractNumber(resume.properties.experience);
                    const jobType = extractSelect(resume.properties.profession);
                    const education = extractPlainText(resume.properties.education);
                    const skills = extractMultiSelect(resume.properties.skills);
                    const salary = extractPlainText(resume.properties.salary);

                    return (
                      <motion.div
                        key={`${resume.id}-${index}`}
                        variants={{
                          initial: { opacity: 0, y: 20 },
                          animate: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.5 }}
                        whileHover={{
                          scale: userRole === "pro" ? 1.03 : 1,
                          boxShadow: userRole === "pro" ? "0px 10px 30px rgba(0, 0, 0, 0.1)" : "none",
                        }}
                      >
                        <Card 
                          className={`h-full flex flex-col border rounded-lg overflow-hidden ${
                            userRole === "pro" ? "cursor-pointer hover:shadow-lg transition-all duration-200" : ""
                          }`}
                          onClick={() => handleCardClick(resume)}
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                  {name || "Name not available"}
                                </CardTitle>
                                <CardDescription>
                                  {location ? `${location}` : 'Location not specified'}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col gap-2">
                                {jobType && (
                                  <Badge variant="secondary" className="capitalize">
                                    {jobType}
                                  </Badge>
                                )}
                                {totalExperience > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {totalExperience} years exp
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            {education && (
                              <p className="text-gray-700 mb-4">
                                <strong>Education:</strong> {education}
                              </p>
                            )}
                            {skills && skills.length > 0 && (
                              <div className="mb-4">
                                <strong className="text-gray-700">
                                  Skills:
                                </strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {skills.slice(0, 3).map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {skills.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="border-t pt-4 mt-4">
                              {userRole === "pro" ? (
                                // Pro users see contact info
                                <>
                                  {email && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      <strong>Email:</strong> {email}
                                    </p>
                                  )}
                                  {phone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <strong>Phone:</strong> {phone}
                                    </p>
                                  )}
                                </>
                              ) : (
                                // Basic users see masked info
                                <>
                                  {email && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      <strong>Email:</strong> {maskEmail(email, userRole)}
                                    </p>
                                  )}
                                  {phone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <strong>Phone:</strong> {maskPhone(phone, userRole)}
                                    </p>
                                  )}
                                  <div className="mt-3">
                                    <a
                                      href="/upgrade"
                                      className="text-xs text-orange-600 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-full font-medium transition-colors duration-200 cursor-pointer"
                                    >
                                      🔒 Upgrade to Pro for full details
                                    </a>
                                  </div>
                                </>
                              )}
                              {salary && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                  </svg>
                                  <strong>Salary:</strong> {salary}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      {/* Previous Button */}
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* Page Numbers */}
                      {generatePaginationItems().map((item, index) => (
                        <PaginationItem key={index}>
                          {item === "ellipsis-start" ||
                          item === "ellipsis-end" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(item as number);
                              }}
                              isActive={currentPage === item}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      {/* Next Button */}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Resume Detail Modal - Only for Pro Users */}
        {selectedResume && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {extractPlainText(selectedResume.properties.name)}
                </DialogTitle>
                <DialogDescription>
                  Complete resume details and contact information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      {selectedResume.properties.email && (
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {extractTitleText(selectedResume.properties.email)}
                        </p>
                      )}
                      {selectedResume.properties.mobile && (
                        <p className="text-sm text-gray-600">
                          <strong>Phone:</strong> {extractPhoneNumber(selectedResume.properties.mobile)}
                        </p>
                      )}
                      {selectedResume.properties.location && (
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {extractPlainText(selectedResume.properties.location)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Professional Details</h3>
                    <div className="space-y-2">
                      {selectedResume.properties.experience && (
                        <p className="text-sm text-gray-600">
                          <strong>Total Experience:</strong> {extractNumber(selectedResume.properties.experience)} years
                        </p>
                      )}
                      {selectedResume.properties.profession && (
                        <p className="text-sm text-gray-600">
                          <strong>Job Type:</strong> {extractSelect(selectedResume.properties.profession)}
                        </p>
                      )}
                      {selectedResume.properties.availability && (
                        <p className="text-sm text-gray-600">
                          <strong>Availability:</strong> {extractSelect(selectedResume.properties.availability)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience and Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Experience & Skills</h3>
                  <div className="space-y-2">
                    {selectedResume.properties.education && (
                      <p className="text-sm text-gray-600">
                        <strong>Education:</strong> {extractPlainText(selectedResume.properties.education)}
                      </p>
                    )}
                    {selectedResume.properties.skills && (
                      <p className="text-sm text-gray-600">
                        <strong>Skills:</strong> {extractMultiSelect(selectedResume.properties.skills).join(", ")}
                      </p>
                    )}
                    {selectedResume.properties.languages && (
                      <p className="text-sm text-gray-600">
                        <strong>Languages:</strong> {extractMultiSelect(selectedResume.properties.languages).join(", ")}
                      </p>
                    )}
                    {selectedResume.properties.certifications && (
                      <p className="text-sm text-gray-600">
                        <strong>Certifications:</strong> {extractMultiSelect(selectedResume.properties.certifications).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Salary Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Salary & Preferences</h3>
                  <div className="space-y-2">
                    {selectedResume.properties.salary && (
                      <p className="text-sm text-gray-600">
                        <strong>Salary:</strong> {extractPlainText(selectedResume.properties.salary)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      // Handle contact action
                      toast.success("Contact information copied to clipboard");
                    }}
                  >
                    Contact Candidate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

export default FindChefPage;
