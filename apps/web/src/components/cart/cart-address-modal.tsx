'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Plus, Compass, Loader2, AlertCircle } from 'lucide-react';
import { Address } from '@bookmarket/types';
import { apiClient } from '@/lib/api-client';

interface CartAddressModalProps {
  isOpen: boolean;
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onClose: () => void;
  onSaveNewAddress: (data: Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }) => Promise<void>;
  onSetDefault: (id: string) => void;
  onDeleteAddress: (id: string) => void;
  isSaving: boolean;
}

const inputCls =
  'w-full h-11 px-4 rounded-2xl border border-border/80 bg-background text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary';

export function CartAddressModal({
  isOpen,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onClose,
  onSaveNewAddress,
  onSetDefault,
  onDeleteAddress,
  isSaving,
}: CartAddressModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [makeDefault, setMakeDefault] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const parseAddress = (str: string) => {
    const parts = str.split(' - ');
    return parts.length > 1
      ? { labelName: parts[0], streetOnly: parts.slice(1).join(' - ') }
      : { labelName: 'Shipping Address', streetOnly: str };
  };

  const handleGPSAutofill = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await apiClient<{ street?: string; city?: string; state?: string; zipCode?: string; country?: string }>(
            `/users/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          if (res) {
            setStreet1(res.street || '');
            setCity(res.city || '');
            setState(res.state || '');
            setZipCode(res.zipCode || '');
            setCountry(res.country || 'India');
          }
        } catch {
          setGpsError('Could not fetch address details via GPS.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'GPS location error.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name required';
    if (!phone.trim()) errs.phone = 'Phone required';
    if (!street1.trim()) errs.street = 'Street line required';
    if (!city.trim()) errs.city = 'City required';
    if (!state.trim()) errs.state = 'State required';
    if (!zipCode.trim()) errs.zipCode = 'Pincode required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const labelPrefix = `[${addressLabel}] ${fullName.trim()} (Phone: ${phone.trim()})`;
    const fullStreetLine = `${labelPrefix} - ${street1.trim()}${street2.trim() ? ', ' + street2.trim() : ''}`;

    await onSaveNewAddress({
      street: fullStreetLine,
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      isDefault: makeDefault,
    });

    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setAddressLabel('Home');
    setFullName('');
    setPhone('');
    setStreet1('');
    setStreet2('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('India');
    setMakeDefault(false);
    setGpsError('');
    setErrors({});
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-lg bg-background border border-border rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h3 className="font-serif text-base font-extrabold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" /> Select Shipping Address
            </h3>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-card transition-all"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-sm text-foreground">Add New Address</h4>
                  <button
                    type="button"
                    onClick={handleGPSAutofill}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-extrabold hover:bg-primary/15 transition-all disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Compass className="h-3.5 w-3.5" />}
                    {isLocating ? 'Locating...' : 'Use GPS'}
                  </button>
                </div>

                {gpsError && (
                  <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-extrabold">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {gpsError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Label</label>
                    <select value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} className={inputCls}>
                      {['Home', 'Work', 'College', 'Other'].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Recipient Name" className={inputCls} />
                    {errors.fullName && <span className="text-[10px] text-danger font-bold">{errors.fullName}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit Phone" className={inputCls} />
                  {errors.phone && <span className="text-[10px] text-danger font-bold">{errors.phone}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Address Line 1 *</label>
                  <input type="text" value={street1} onChange={(e) => setStreet1(e.target.value)} placeholder="Flat, Street, Area" className={inputCls} />
                  {errors.street && <span className="text-[10px] text-danger font-bold">{errors.street}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
                    {errors.city && <span className="text-[10px] text-danger font-bold">{errors.city}</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">State *</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={inputCls} />
                    {errors.state && <span className="text-[10px] text-danger font-bold">{errors.state}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Pincode *</label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Pincode" className={inputCls} />
                    {errors.zipCode && <span className="text-[10px] text-danger font-bold">{errors.zipCode}</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-muted-foreground uppercase mb-1">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="rounded accent-secondary" />
                  <span className="text-xs font-bold text-muted-foreground">Set as default shipping address</span>
                </label>

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 h-11 bg-secondary text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="h-11 px-5 border border-border text-muted-foreground font-bold text-xs rounded-2xl hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <button
                      key={address._id}
                      onClick={() => onSelectAddress(address._id!)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                        selectedAddressId === address._id
                          ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20'
                          : 'border-border hover:border-border/80 bg-card'
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedAddressId === address._id ? 'border-secondary' : 'border-muted-foreground'
                      }`}>
                        {selectedAddressId === address._id && <div className="h-2 w-2 rounded-full bg-secondary" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-foreground">{parseAddress(address.street).labelName}</p>
                          {address.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-xs font-extrabold text-secondary uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{parseAddress(address.street).streetOnly}</p>
                        <p className="text-xs text-muted-foreground font-semibold">{address.city}, {address.state} – {address.zipCode}</p>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        {!address.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetDefault(address._id!);
                            }}
                            className="text-[10px] font-extrabold text-secondary hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAddress(address._id!);
                          }}
                          className="text-[10px] font-extrabold text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-muted/30">
                    <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs font-bold text-muted-foreground">No shipping address added yet</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full h-11 flex items-center justify-center gap-2 border border-dashed border-secondary/40 text-secondary font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary/5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 bg-secondary text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-secondary/90 transition-all active:scale-95"
                  >
                    Confirm Address
                  </button>
                  <button onClick={onClose} className="h-11 px-5 border border-border text-muted-foreground font-bold text-xs rounded-2xl hover:bg-muted transition-all">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
