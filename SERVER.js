const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname));

mongoose.connect("mongodb://127.0.0.1:27017/seema3", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); 
  });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'azeemafirdous14@gmail.com',
    pass: 'krvf ujuo axfy jwna'
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("✅ Created uploads directory");
      } catch (err) {
        console.error("❌ Failed to create uploads directory:", err.message);
        return cb(new Error("Failed to create uploads directory: " + err.message), null);
      }
    }
    
    fs.access(uploadDir, fs.constants.W_OK, (err) => {
      if (err) {
        console.error("❌ Uploads directory is not writable:", err.message);
        return cb(new Error("Uploads directory is not writable: " + err.message), null);
      }
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    console.log(`✅ Uploading file: ${file.originalname} as ${uniqueName}`);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    console.error("❌ Invalid file type:", file.originalname);
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharUpload', maxCount: 1 },
  { name: 'panUpload', maxCount: 1 },
  { name: 'sscCertificate', maxCount: 1 },
  { name: 'interCertificate', maxCount: 1 },
  { name: 'degCertificate', maxCount: 1 },
  { name: 'researchPapers', maxCount: 10 },
  { name: 'conferenceCertificates', maxCount: 10 },
  { name: 'awardsUpload', maxCount: 10 },
  { name: 'certsUpload', maxCount: 10 }
]);

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer error:", err.message);
    return res.status(400).json({ error: "File upload error: " + err.message });
  } else if (err) {
    console.error("❌ File upload error:", err.message);
    return res.status(400).json({ error: "File upload error: " + err.message });
  }
  next();
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const facultySchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  role: String,
  phone: String,
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date
});
const Faculty = mongoose.model("Faculty", facultySchema);

const facultyProfileSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  dob: Date,
  phone: String,
  gender: String,
  aadhar: String,
  pan: String,
  sscSchool: String,
  sscBoard: String,
  sscPercent: Number,
  sscYear: Number,
  interCollege: String,
  interPercent: Number,
  interYear: Number,
  degCollege: String,
  degBranch: String,
  degCGPA: Number,
  degYear: Number,
  phdStatus: String,
  phdDetails: String,
  experience: Number,
  awards: String,
  certs: String,
  research: String,
  conferences: Array,
  photoPath: String,
  aadharPath: String,
  panPath: String,
  sscCertPath: String,
  interCertPath: String,
  degCertPath: String,
  researchPapers: Array,
  conferenceCerts: Array,
  awardsCertPaths: Array,
  certsPaths: Array
});
facultyProfileSchema.index({ email: 1 });
facultyProfileSchema.index({ degBranch: 1 });
const FacultyProfile = mongoose.model("FacultyProfile", facultyProfileSchema);

const grievanceSchema = new mongoose.Schema({
  facultyName: { type: String, required: true },
  facultyEmail: { type: String, required: true },
  department: { type: String, required: true },
  grievance: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});
const Grievance = mongoose.model('Grievance', grievanceSchema);

const hodCredentials = [
  { username: "hod_cse", password: "cse123", department: "CSE" },
  { username: "hod_it", password: "it123", department: "IT" },
  { username: "hod_csd", password: "csd123", department: "CSD" },
  { username: "hod_csm", password: "csm123", department: "CSM" },
  { username: "hod_ece", password: "ece123", department: "ECE" },
  { username: "hod_ai", password: "ai123", department: "AI" },
];

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, role, phone } = req.body;

    if (!name || !email || !password || !department || !role || !phone) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const existingUser = await Faculty.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists!" });
    }

    if (role === "hod") {
      const validHOD = hodCredentials.find(
        hod => hod.username === email.split('@')[0] && password === hod.password
      );
      
      if (!validHOD) {
        return res.status(400).json({ error: "Invalid HOD credentials!" });
      }
    }

    const newFaculty = new Faculty({ 
      name, 
      email, 
      password, 
      department, 
      role, 
      phone 
    });
    
    await newFaculty.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    if (email === "admin" && password === "admin123") {
      return res.status(200).json({ 
        message: "Admin login successful!", 
        role: "admin",
        redirect: "ADMINDASHBOARD.html"
      });
    }
    const hodUser = hodCredentials.find(
      hod => hod.username === email.split('@')[0] && hod.password === password
    );
    
    if (hodUser) {
      return res.status(200).json({
        message: "HOD login successful!",
        role: "hod",
        redirect: "HODDASHBOARD.html",
        department: hodUser.department,
        email: `${hodUser.username}@hod.com`
      });
    }

    const user = await Faculty.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid Email or Password!" });
    }
    if (user.role === "faculty") {
      const profile = await FacultyProfile.findOne({ email });
      return res.status(200).json({ 
        message: "Login successful!", 
        role: user.role,
        hasProfile: !!profile,
        email: user.email,
        redirect: "FACULTYDASHBOARD.html"
      });
    }
    return res.status(200).json({ 
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful!`, 
      role: user.role,
      redirect: `${user.role}-LOGIN.html`
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await Faculty.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 600000; 
    await user.save();

    const mailOptions = {
      from: 'azeemafirdous14@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error.message);
    res.status(500).json({ error: 'Error sending OTP: ' + error.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await Faculty.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified' });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    res.status(500).json({ error: 'Error verifying OTP: ' + error.message });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match!' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must contain: 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&)' 
      });
    }

    const user = await Faculty.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP!' });
    }
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    console.error("❌ Password Reset Error:", error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get("/api/faculty/:email", async (req, res) => {
  try {
    const profile = await FacultyProfile.findOne({ email: req.params.email });
    if (!profile) {
      return res.status(404).json({ exists: false });
    }
    
    // Convert to plain object and include all document paths
    const profileData = profile.toObject();
    res.status(200).json({ 
      exists: true, 
      profile: profileData 
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.post("/api/faculty", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    const { email, conferences } = req.body;
    const files = req.files;
    console.log("📂 Received files:", files);
    let parsedConferences = [];
    if (conferences) {
      try {
        parsedConferences = JSON.parse(conferences);
      } catch (parseError) {
        console.error("❌ Error parsing conferences:", parseError.message);
        return res.status(400).json({ error: "Invalid conferences data: " + parseError.message });
      }
    }

    const profileData = {
      email: req.body.email,
      name: req.body.name,
      dob: req.body.dob ? new Date(req.body.dob) : undefined,
      phone: req.body.phone,
      gender: req.body.gender,
      aadhar: req.body.aadhar,
      pan: req.body.pan,
      sscSchool: req.body.sscSchool,
      sscBoard: req.body.sscBoard,
      sscPercent: req.body.sscPercent ? parseFloat(req.body.sscPercent) : undefined,
      sscYear: req.body.sscYear ? parseInt(req.body.sscYear) : undefined,
      interCollege: req.body.interCollege,
      interPercent: req.body.interPercent ? parseFloat(req.body.interPercent) : undefined,
      interYear: req.body.interYear ? parseInt(req.body.interYear) : undefined,
      degCollege: req.body.degCollege,
      degBranch: req.body.degBranch,
      degCGPA: req.body.degCGPA ? parseFloat(req.body.degCGPA) : undefined,
      degYear: req.body.degYear ? parseInt(req.body.degYear) : undefined,
      phdStatus: req.body.phdStatus,
      phdDetails: req.body.phdDetails,
      experience: req.body.experience ? parseInt(req.body.experience) : undefined,
      awards: req.body.awards,
      certs: req.body.certs,
      research: req.body.research,
      conferences: parsedConferences,
      photoPath: files.photo ? files.photo[0].path : undefined,
      aadharPath: files.aadharUpload ? files.aadharUpload[0].path : undefined,
      panPath: files.panUpload ? files.panUpload[0].path : undefined,
      sscCertPath: files.sscCertificate ? files.sscCertificate[0].path : undefined,
      interCertPath: files.interCertificate ? files.interCertificate[0].path : undefined,
      degCertPath: files.degCertificate ? files.degCertificate[0].path : undefined,
      researchPapers: files.researchPapers ? files.researchPapers.map(f => f.path) : [],
      conferenceCerts: files.conferenceCertificates ? files.conferenceCertificates.map(f => f.path) : [],
      awardsCertPaths: files.awardsUpload ? files.awardsUpload.map(f => f.path) : [],
      certsPaths: files.certsUpload ? files.certsUpload.map(f => f.path) : []
    };

    // Remove undefined fields to avoid MongoDB schema issues
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    const existingProfile = await FacultyProfile.findOne({ email });
    
    if (existingProfile) {
      // Preserve existing document paths if new files aren't uploaded
      if (!profileData.photoPath && existingProfile.photoPath) profileData.photoPath = existingProfile.photoPath;
      if (!profileData.aadharPath && existingProfile.aadharPath) profileData.aadharPath = existingProfile.aadharPath;
      if (!profileData.panPath && existingProfile.panPath) profileData.panPath = existingProfile.panPath;
      if (!profileData.sscCertPath && existingProfile.sscCertPath) profileData.sscCertPath = existingProfile.sscCertPath;
      if (!profileData.interCertPath && existingProfile.interCertPath) profileData.interCertPath = existingProfile.interCertPath;
      if (!profileData.degCertPath && existingProfile.degCertPath) profileData.degCertPath = existingProfile.degCertPath;
      
      // For arrays, merge existing and new entries
      if (existingProfile.researchPapers && existingProfile.researchPapers.length > 0) {
        profileData.researchPapers = [...(profileData.researchPapers || []), ...existingProfile.researchPapers];
      }
      if (existingProfile.conferenceCerts && existingProfile.conferenceCerts.length > 0) {
        profileData.conferenceCerts = [...(profileData.conferenceCerts || []), ...existingProfile.conferenceCerts];
      }
      if (existingProfile.awardsCertPaths && existingProfile.awardsCertPaths.length > 0) {
        profileData.awardsCertPaths = [...(profileData.awardsCertPaths || []), ...existingProfile.awardsCertPaths];
      }
      if (existingProfile.certsPaths && existingProfile.certsPaths.length > 0) {
        profileData.certsPaths = [...(profileData.certsPaths || []), ...existingProfile.certsPaths];
      }

      await FacultyProfile.updateOne({ email }, { $set: profileData });
      console.log(`✅ Profile updated for email: ${email}`);
      return res.status(200).json({ message: "Profile updated!" });
    } else {
      const newProfile = new FacultyProfile(profileData);
      await newProfile.save();
      console.log(`✅ Profile created for email: ${email}`);
      return res.status(201).json({ message: "Profile created!" });
    }
  } catch (error) {
    console.error("❌ Profile save error:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.get('/grievance', (req, res) => {
  res.sendFile(path.join(__dirname, 'GRTEVANCE.html'));
});

app.post('/submit-grievance', async (req, res) => {
  try {
    const { facultyName, facultyEmail, department, grievance } = req.body;
    const newGrievance = new Grievance({ facultyName, facultyEmail, department, grievance });
    await newGrievance.save();
    res.status(200).json({ message: "Grievance submitted successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

app.get("/api/faculty-documents", async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    
    if (department) {
      query.degBranch = { $regex: new RegExp(department, 'i') };
    }

    const faculty = await FacultyProfile.find(query)
      .select('name degBranch photoPath certsPaths awardsCertPaths')
      .lean();

    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching faculty documents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/faculty", async (req, res) => {
  try {
    const faculty = await FacultyProfile.find()
      .select('name email phone degBranch photoPath certsPaths awardsCertPaths')
      .lean();
      
    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/faculty/:id", async (req, res) => {
  try {
    const faculty = await FacultyProfile.findById(req.params.id)
      .select('-__v')
      .lean();
      
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    
    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching faculty details:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/faculty-documents", async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    
    if (department) {
      query.degBranch = { $regex: new RegExp(department, 'i') };
    }

    const faculty = await FacultyProfile.find(query)
      .select('name email degBranch photoPath certsPaths awardsCertPaths researchPapers conferenceCerts')
      .lean();

    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching faculty documents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/research-papers", async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    
    if (department) {
      query.degBranch = { $regex: new RegExp(department, 'i') };
    }

    const faculty = await FacultyProfile.find(query)
      .select('name degBranch researchPapers')
      .lean();

    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching research papers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});