import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import backend from "@/lib/backend";
import { useNavigate } from "react-router-dom";

interface FormData {
  season: string;
  skillLevel: string;
  gender: string;
  registrationFee: string;
  firstName: string;
  lastName: string;
  age: string;
  parentsName: string;
  workPhone1: string;
  workPhone2: string;
  workPhone3: string;
  homePhone1: string;
  homePhone2: string;
  homePhone3: string;
  cellPhone1: string;
  cellPhone2: string;
  cellPhone3: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  areaOfSanDiego: string;
  howHear: string;
  teeSize: string;
  teesColor: string;
  tees: string;
  couponCode: string;
  termsAccepted: boolean;
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    season: "",
    skillLevel: "",
    gender: "",
    registrationFee: "",
    firstName: "",
    lastName: "",
    age: "",
    parentsName: "",
    workPhone1: "",
    workPhone2: "",
    workPhone3: "",
    homePhone1: "",
    homePhone2: "",
    homePhone3: "",
    cellPhone1: "",
    cellPhone2: "",
    cellPhone3: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    areaOfSanDiego: "",
    howHear: "",
    teeSize: "XLarge",
    teesColor: "White",
    tees: "0",
    couponCode: "",
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = async () => {
    if (!formData.termsAccepted) {
      toast({
        title: "Terms Required",
        description: "You must accept the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields (name and email).",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast({
        title: "Password Required",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Register with local auth
      const authResult = await backend.auth.register({
        email: formData.email,
        password: formData.password
      });

      if (authResult.error) {
        throw new Error(authResult.error);
      }

      // Create member record
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
      const phone = `${formData.cellPhone1}${formData.cellPhone2}${formData.cellPhone3}`;

      const memberData = {
        user_id: 0, // Will be filled by the system after auth user creation
        membership_type_id: formData.registrationFee === "130.00" ? 2 : 1, // Assuming 1=seasonal, 2=annual
        skill_level_id: parseFloat(formData.skillLevel) || 3.5,
        date_of_birth: formData.age ? new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString() : "",
        gender: formData.gender,
        address: fullAddress,
        emergency_contact_name: formData.parentsName || "",
        emergency_contact_phone: phone || "",
        tennis_rating: parseFloat(formData.skillLevel) || 3.5,
        preferred_hand: "Right",
        medical_conditions: "",
        membership_start_date: new Date().toISOString(),
        membership_end_date: formData.registrationFee === "130.00" ?
        new Date(new Date().getFullYear() + 1, 11, 31).toISOString() :
        new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()).toISOString(),
        is_active: true,
        profile_image: "",
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const user = authResult.data!;
      const memberResult = await backend.members.create({ ...memberData, user_id: user.ID });

      if (memberResult.error) {
        throw new Error(memberResult.error);
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email for verification instructions."
      });

      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/members/memberlogin');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: typeof error === 'string' ? error : "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Tennis League San Diego Registration</h1>

          <form className="space-y-8">
            {/* Registration Information */}
            <div className="border border-gray-300">
              <div className="bg-gray-500 text-white px-4 py-3 font-semibold">
                Registration Information
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">Season</label>
                  <div className="md:col-span-2">
                    <Select value={formData.season} onValueChange={(value) => updateField('season', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="winter">WINTER: Jan 7 - April 5</SelectItem>
                        <SelectItem value="spring">SPRING: April 7 - July 5</SelectItem>
                        <SelectItem value="summer">SUMMER: July 7 - Oct 5</SelectItem>
                        <SelectItem value="fall">FALL: Oct 7 - Jan 5</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-black mt-1">Players should register with the intent of playing a minimum of 3 matches in a 3 month season</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">Skill Level</label>
                  <div className="md:col-span-2">
                    <Select value={formData.skillLevel} onValueChange={(value) => updateField('skillLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Skill Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5.0">5.0</SelectItem>
                        <SelectItem value="4.5">4.5</SelectItem>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="3.6">3.6</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-2">
                      <p className="font-medium text-sm">TLSD Division Help:</p>
                      <ul className="text-xs text-black list-disc list-inside space-y-1 mt-1">
                        <li>If you have a Universal Tennis Rating (UTR), use this guide to help select your corresponding Division: 3.6 (our 3.5) = UTR 2 - 3.5, 4.0 = UTR 3.5 - 4.75, 4.5 = UTR 4.75 - 6, 5.0 = UTR 6 & over.</li>
                        <li>If you play USTA tournaments, you will generally play one level up in TLSD. Example: USTA 4.0 = TLSD 4.5.</li>
                        <li>If you're not sure, <a href="/skill-level-guide/" className="text-blue-600 underline">check your skill level here</a> to help self rate.</li>
                        <li>Note that competitive standards are enforced. Should you be significantly over or under-qualified for your selected Division, you will be moved accordingly. If you don't agree, please do not register. No refunds.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">Gender</label>
                  <div className="md:col-span-2">
                    <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-black mt-1">Divisions are co-ed, but mostly male in make up.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">Registration Fees</label>
                  <div className="md:col-span-2">
                    <Select value={formData.registrationFee} onValueChange={(value) => updateField('registrationFee', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select One" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40.00">One Season...........................$40.00</SelectItem>
                        <SelectItem value="130.00">Annual..................................$130.00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="border border-gray-300">
              <div className="bg-gray-500 text-white px-4 py-3 font-semibold">
                Personal Information
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">First Name (Player)</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="w-full max-w-sm" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Last Name (Player)</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full max-w-sm" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Age (Junior players only)</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                      className="w-full max-w-sm" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">Parent's name (for players under age 18)</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.parentsName}
                      onChange={(e) => updateField('parentsName', e.target.value)}
                      className="w-full max-w-sm" />

                    <p className="text-xs text-black mt-1">Note: Parents of players under 18, please contact League Director prior to registering your player. Parents also agree to supervise all email messaging activity of minor player.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Work Phone</label>
                  <div className="md:col-span-2 flex items-center gap-1">
                    <span>(</span>
                    <Input
                      value={formData.workPhone1}
                      onChange={(e) => updateField('workPhone1', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>)</span>
                    <Input
                      value={formData.workPhone2}
                      onChange={(e) => updateField('workPhone2', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>-</span>
                    <Input
                      value={formData.workPhone3}
                      onChange={(e) => updateField('workPhone3', e.target.value)}
                      maxLength={4}
                      className="w-16" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Home Phone</label>
                  <div className="md:col-span-2 flex items-center gap-1">
                    <span>(</span>
                    <Input
                      value={formData.homePhone1}
                      onChange={(e) => updateField('homePhone1', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>)</span>
                    <Input
                      value={formData.homePhone2}
                      onChange={(e) => updateField('homePhone2', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>-</span>
                    <Input
                      value={formData.homePhone3}
                      onChange={(e) => updateField('homePhone3', e.target.value)}
                      maxLength={4}
                      className="w-16" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Mobile</label>
                  <div className="md:col-span-2 flex items-center gap-1">
                    <span>(</span>
                    <Input
                      value={formData.cellPhone1}
                      onChange={(e) => updateField('cellPhone1', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>)</span>
                    <Input
                      value={formData.cellPhone2}
                      onChange={(e) => updateField('cellPhone2', e.target.value)}
                      maxLength={3}
                      className="w-12" />

                    <span>-</span>
                    <Input
                      value={formData.cellPhone3}
                      onChange={(e) => updateField('cellPhone3', e.target.value)}
                      maxLength={4}
                      className="w-16" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">E-mail *</label>
                  <div className="md:col-span-2">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full max-w-sm"
                      required />

                    <p className="text-xs text-black mt-1">Note to parents: Each Junior player must have their own email address.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Password *</label>
                  <div className="md:col-span-2">
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full max-w-sm"
                      placeholder="Minimum 8 characters"
                      required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Confirm Password *</label>
                  <div className="md:col-span-2">
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="w-full max-w-sm"
                      placeholder="Re-enter password"
                      required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Address(include Unit or Apt. #)</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="w-full" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">City</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full max-w-xs" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">State</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      maxLength={2}
                      className="w-16" />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Zip Code</label>
                  <div className="md:col-span-2">
                    <Input
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      className="w-24" />

                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="font-medium text-sm">What area of San Diego do you live in?</label>
                  <Input
                    value={formData.areaOfSanDiego}
                    onChange={(e) => updateField('areaOfSanDiego', e.target.value)}
                    className="w-full max-w-xs" />

                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="font-medium text-sm">How did you hear about the League?</label>
                  <Input
                    value={formData.howHear}
                    onChange={(e) => updateField('howHear', e.target.value)}
                    className="w-full max-w-md" />

                </div>
              </div>
            </div>

            {/* Tennis League Shirts */}
            <div className="border border-gray-300">
              <div className="bg-gray-500 text-white px-4 py-3 font-semibold">
                Tennis League Shirts <span className="text-sm font-normal">(Men's Sizes Only)</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label className="font-medium text-sm">League T-Shirt</label>
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Select value={formData.teeSize} onValueChange={(value) => updateField('teeSize', value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XLarge">XLarge</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={formData.teesColor} onValueChange={(value) => updateField('teesColor', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="White">White</SelectItem>
                          <SelectItem value="Grey">Grey</SelectItem>
                          <SelectItem value="Bright Blue">Bright Blue</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={formData.tees} onValueChange={(value) => updateField('tees', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="25">1 for $25</SelectItem>
                          <SelectItem value="40">2 for $40</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <span className="text-red-600 font-bold text-xs">(Optional)</span>
                      <a href="https://www.tennisleague.com/wp-content/uploads/2018/12/league_shirts.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                        click here for image
                      </a>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>*Shirt price includes $7.00 shipping and sales tax.</p>
                      <p><strong>Note:</strong> Call 619 846-1125 for multiple sizes and/or colors.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Information */}
            <div className="border border-gray-300">
              <div className="bg-gray-500 text-white px-4 py-3 font-semibold">
                Coupon Information <span className="text-sm font-normal">(This section only for coupon holders)</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="font-medium text-sm">Coupon Code</label>
                  <div className="md:col-span-2">
                    <Input
                      type="password"
                      value={formData.couponCode}
                      onChange={(e) => updateField('couponCode', e.target.value)}
                      autoComplete="off"
                      className="w-full max-w-xs" />

                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border border-gray-300">
              <div className="bg-gray-500 text-white px-4 py-3 font-semibold">
                Terms & Conditions
              </div>
              <div className="p-6 space-y-4">
                <div className="text-sm text-black leading-relaxed">
                  By registering and playing in Tennis League, Member hereby agrees to indemnify and save harmless Tennis League San Diego; Stephen de la Torre, Owner/Director; or its assignee or nominee (collectively "TLSD") from and against any and all claims, loss, damage, injury, illness, costs and expenses which may be asserted against TLSD by Member or any other person as a result of any activities related to Member's membership in Tennis League, including <strong>without limitation</strong>, transportation mishaps, no-shows by other members, <strong>illness</strong> or injury, on or off the court. Member acknowledges and consents to scores and associated information of any matches played being publicly accessible. Member also agrees that registering to play constitutes full agreement and consent. Member further agrees that this agreement is applicable to any season played in TLSD; past, present or future.
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => updateField('termsAccepted', checked as boolean)} />

                  <label className="text-sm">I accept the terms and conditions</label>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="font-bold mb-4">Pay by credit card: Please click the "Continue" button below to finalize payment and receive your login information</p>
                <div className="mb-6">
                  <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=60&fit=crop" alt="PayPal Logo" className="mx-auto h-16" />
                </div>
                <Button
                  type="button"
                  onClick={validateForm}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2">

                  {isLoading ? 'Registering...' : 'Continue'}
                </Button>
              </div>

              <div className="text-center space-y-4">
                <p>No credit card? Mail your check to:</p>
                <div className="text-green-600 font-bold">
                  <p>TENNIS LEAGUE SAN DIEGO</p>
                  <p>12630 Fairford Rd</p>
                  <p>SAN DIEGO, CA 92128</p>
                </div>
                <p>To pay by money transfer such as Venmo or Zelle, please call Director.</p>
                <div>
                  <p>Telephone Number:</p>
                  <p className="font-bold text-lg">619.846.1125</p>
                  <p className="text-gray-600">Director: Steve de la Torre</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>);

}
