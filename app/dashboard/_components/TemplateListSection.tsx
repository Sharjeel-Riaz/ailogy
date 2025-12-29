"use client";
import React, { useEffect, useState } from "react";
import TemplateCard from "./TemplateCard";
import { v4 as uuidv4 } from "uuid";
import { Loader2 } from "lucide-react";

export interface TEMPLATE {
  name: string;
  desc: string;
  icon: string;
  category: string;
  slug: string;
  aiPrompt: string;
  form?: FORM[];
}

export interface FORM {
  label: string;
  field: string;
  name: string;
  required?: boolean;
}

function TemplateListSection({ userSearchInput }: any) {
  const [templateList, setTemplateList] = useState<TEMPLATE[]>([]);
  const [allTemplates, setAllTemplates] = useState<TEMPLATE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const data = await response.json();
        setAllTemplates(data);
        setTemplateList(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userSearchInput) {
      setTemplateList(
        allTemplates.filter((template: TEMPLATE) =>
          template.name.toLowerCase().includes(userSearchInput.toLowerCase())
        )
      );
    } else {
      setTemplateList(allTemplates);
    }
  }, [userSearchInput, allTemplates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (templateList.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-100">
        <p className="text-gray-500 text-lg">No templates available yet.</p>
        <p className="text-gray-400 text-sm">
          Check back later for new content tools!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-10">
      {templateList.map((item) => (
        <TemplateCard {...item} key={uuidv4()} />
      ))}
    </div>
  );
}

export default TemplateListSection;
