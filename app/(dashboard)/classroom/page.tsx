"use client";

import React, { useState } from "react";
import { GraduationCap, Search, PlusCircle, ArrowRight } from "lucide-react";

export default function ClassroomPage() {
  const [search, setSearch] = useState("");

  const classes = [
    {
      id: "cls_10a",
      name: "Grade 10 — Biology (Section A)",
      subject: "Science / Biology",
      studentsCount: 32,
      assessmentsCount: 8,
      avgScore: "84%",
    },
    {
      id: "cls_9b",
      name: "Grade 9 — General Science (Section B)",
      subject: "Science",
      studentsCount: 28,
      assessmentsCount: 6,
      avgScore: "79%",
    },
    {
      id: "cls_11a",
      name: "Grade 11 — Advanced Chemistry",
      subject: "Chemistry",
      studentsCount: 24,
      assessmentsCount: 5,
      avgScore: "88%",
    },
  ];

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold uppercase mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Classroom Management</span>
          </div>
          <h1 className="text-2xl font-black text-[#21262C]">My Classrooms</h1>
          <p className="text-xs text-[#606266] mt-1">
            Manage your classes, view student rosters, and analyze performance trends.
          </p>
        </div>

        <button className="px-5 py-3 rounded-2xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all">
          <PlusCircle className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8C8C8C] absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search classrooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E2E2] rounded-2xl text-xs font-medium text-[#21262C] placeholder-[#8C8C8C] focus:outline-none focus:border-[#FF5500] shadow-xs"
        />
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#E2E2E2] rounded-3xl p-6 shadow-xs hover:border-[#FFCCAA] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#21262C]">{c.name}</h3>
                <p className="text-xs text-[#8C8C8C]">{c.subject}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F0F0] text-center">
                <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#E2E2E2]">
                  <span className="text-[10px] text-[#8C8C8C] font-semibold block">
                    Students
                  </span>
                  <span className="text-xs font-extrabold text-[#21262C]">
                    {c.studentsCount}
                  </span>
                </div>
                <div className="bg-[#FAFAFA] p-2 rounded-xl border border-[#E2E2E2]">
                  <span className="text-[10px] text-[#8C8C8C] font-semibold block">
                    Exams
                  </span>
                  <span className="text-xs font-extrabold text-[#21262C]">
                    {c.assessmentsCount}
                  </span>
                </div>
                <div className="bg-[#F0FDF4] p-2 rounded-xl border border-[#BBF7D0]">
                  <span className="text-[10px] text-[#166534] font-semibold block">
                    Avg Score
                  </span>
                  <span className="text-xs font-extrabold text-[#15803D]">
                    {c.avgScore}
                  </span>
                </div>
              </div>
            </div>

            <button className="mt-5 w-full py-2.5 rounded-xl bg-[#F6F6F6] hover:bg-[#EAEAEA] text-[#21262C] font-bold text-xs border border-[#E2E2E2] flex items-center justify-center gap-1.5 transition-colors">
              <span>View Roster</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8C8C8C]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
