"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, MapPin, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LocationSelectionValue {
  countryId?: number | string | null;
  countryName?: string;
  stateId?: number | string | null;
  stateName?: string;
  cityId?: number | string | null;
  cityName?: string;
  formattedLocation: string;
}

interface LocationCascadeSelectorProps {
  initialCountry?: string;
  initialState?: string;
  initialCity?: string;
  onChange?: (value: LocationSelectionValue) => void;
  className?: string;
  showLabels?: boolean;
  required?: boolean;
}

export function LocationCascadeSelector({
  initialCountry = '',
  initialState = '',
  initialCity = '',
  onChange,
  className = '',
  showLabels = true,
  required = false
}: LocationCascadeSelectorProps) {
  // Lists State
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Selection State
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedCountryName, setSelectedCountryName] = useState<string>(initialCountry);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>(initialState);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>(initialCity);

  // Loading States
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Fetch Countries on Mount
  useEffect(() => {
    async function loadCountries() {
      setLoadingCountries(true);
      try {
        const res = await fetch('/api/locations/cascade?type=countries');
        if (res.ok) {
          const data = await res.json();
          const list = data.countries || [];
          setCountries(list);
        }
      } catch (err) {
        console.error("Failed to load countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    }
    loadCountries();
  }, []);

  // Sync initialCountry with countries list
  useEffect(() => {
    if (countries.length > 0 && initialCountry) {
      const cleanInit = initialCountry.split('(')[0].trim().toLowerCase();
      const found = countries.find(
        (c: any) =>
          c.name.toLowerCase() === cleanInit ||
          c.name.toLowerCase() === initialCountry.toLowerCase() ||
          c.code.toLowerCase() === initialCountry.toLowerCase() ||
          c.id.toString() === initialCountry.toString()
      );
      if (found && selectedCountryId !== found.id.toString()) {
        setSelectedCountryId(found.id.toString());
        setSelectedCountryName(found.name);
      }
    }
  }, [countries, initialCountry]);

  // 2. Fetch States when Country selection changes
  const fetchStates = useCallback(async (cId: string) => {
    if (!cId) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    try {
      const res = await fetch(`/api/locations/cascade?type=states&countryId=${cId}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.states || [];
        setStates(list);
      }
    } catch (err) {
      console.error("Failed to load states:", err);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountryId, fetchStates]);

  // Sync initialState with states list
  useEffect(() => {
    if (states.length > 0 && initialState) {
      const cleanInit = initialState.trim().toLowerCase();
      const found = states.find(
        (s: any) =>
          s.name.toLowerCase() === cleanInit ||
          s.id.toString() === initialState.toString()
      );
      if (found && selectedStateId !== found.id.toString()) {
        setSelectedStateId(found.id.toString());
        setSelectedStateName(found.name);
      }
    }
  }, [states, initialState]);

  // 3. Fetch Cities when State selection changes
  const fetchCities = useCallback(async (sId: string) => {
    if (!sId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch(`/api/locations/cascade?type=cities&stateId=${sId}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.cities || [];
        setCities(list);
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      fetchCities(selectedStateId);
    } else {
      setCities([]);
    }
  }, [selectedStateId, fetchCities]);

  // Sync initialCity with cities list
  useEffect(() => {
    if (cities.length > 0 && initialCity) {
      const cleanInit = initialCity.split('★')[0].trim().toLowerCase();
      const found = cities.find(
        (ci: any) =>
          ci.name.toLowerCase() === cleanInit ||
          ci.name.toLowerCase() === initialCity.toLowerCase() ||
          ci.id.toString() === initialCity.toString()
      );
      if (found && selectedCityId !== found.id.toString()) {
        setSelectedCityId(found.id.toString());
        setSelectedCityName(found.name);
      }
    }
  }, [cities, initialCity]);

  const notifyChange = (
    cId: string, cName: string,
    sId: string, sName: string,
    ciId: string, ciName: string
  ) => {
    const parts = [ciName, sName, cName].filter(Boolean);
    const formatted = parts.join(', ');

    if (onChange) {
      onChange({
        countryId: cId || null,
        countryName: cName,
        stateId: sId || null,
        stateName: sName,
        cityId: ciId || null,
        cityName: ciName,
        formattedLocation: formatted
      });
    }
  };

  const handleCountrySelect = (cId: string) => {
    const cObj = countries.find(c => c.id.toString() === cId);
    const cName = cObj ? cObj.name : '';

    setSelectedCountryId(cId);
    setSelectedCountryName(cName);

    setSelectedStateId('');
    setSelectedStateName('');
    setSelectedCityId('');
    setSelectedCityName('');
    setStates([]);
    setCities([]);

    notifyChange(cId, cName, '', '', '', '');
  };

  const handleStateSelect = (sId: string) => {
    const sObj = states.find(s => s.id.toString() === sId);
    const sName = sObj ? sObj.name : '';

    setSelectedStateId(sId);
    setSelectedStateName(sName);

    setSelectedCityId('');
    setSelectedCityName('');
    setCities([]);

    notifyChange(selectedCountryId, selectedCountryName, sId, sName, '', '');
  };

  const handleCitySelect = (ciId: string) => {
    const ciObj = cities.find(ci => ci.id.toString() === ciId);
    const ciName = ciObj ? ciObj.name : '';

    setSelectedCityId(ciId);
    setSelectedCityName(ciName);

    notifyChange(selectedCountryId, selectedCountryName, selectedStateId, selectedStateName, ciId, ciName);
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {/* 1. Country Selection */}
      <div className="space-y-1.5">
        {showLabels && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            Country {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <Select value={selectedCountryId} onValueChange={handleCountrySelect} disabled={loadingCountries}>
          <SelectTrigger className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm">
            <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select Country..."} />
          </SelectTrigger>
          <SelectContent className="max-h-[160px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50">
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} className="h-10 text-xs font-medium cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 dark:focus:bg-slate-800 focus:text-indigo-700">
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. State / Province Selection */}
      <div className="space-y-1.5">
        {showLabels && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            State / Province
          </label>
        )}
        <Select
          value={selectedStateId}
          onValueChange={handleStateSelect}
          disabled={!selectedCountryId || loadingStates}
        >
          <SelectTrigger className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={
              loadingStates
                ? "Loading states..."
                : !selectedCountryId
                ? "Select Country First"
                : "Select State / Province..."
            } />
          </SelectTrigger>
          <SelectContent className="max-h-[160px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50">
            {states.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()} className="h-10 text-xs font-medium cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 dark:focus:bg-slate-800 focus:text-indigo-700">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. City Selection */}
      <div className="space-y-1.5">
        {showLabels && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            City / Metro
          </label>
        )}
        <Select
          value={selectedCityId}
          onValueChange={handleCitySelect}
          disabled={!selectedStateId || loadingCities}
        >
          <SelectTrigger className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={
              loadingCities
                ? "Loading cities..."
                : !selectedStateId
                ? "Select State First"
                : "Select City..."
            } />
          </SelectTrigger>
          <SelectContent className="max-h-[160px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50">
            {cities.map((ci) => (
              <SelectItem key={ci.id} value={ci.id.toString()} className="h-10 text-xs font-medium cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 dark:focus:bg-slate-800 focus:text-indigo-700">
                <div className="flex items-center justify-between w-full gap-2">
                  <span>{ci.name}</span>
                  {ci.is_featured && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      ★ Metro
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
