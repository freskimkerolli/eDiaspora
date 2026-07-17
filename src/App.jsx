import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const categorySections = [
  {
    title: "Prona",
    emoji: "🏠",
    items: [
      "Banesa",
      "Shtëpi",
      "Vila",
      "Toka",
      "Lokale afariste",
      "Objekte industriale",
      "Menaxhim pronash",
      "Vlerësim i pronës",
    ],
  },
  {
    title: "Ndërtim",
    emoji: "🏗",
    items: [
      "Kompani ndërtimi",
      "Arkitektë",
      "Inxhinierë",
      "Mbikëqyrje punimesh",
      "Izolim",
      "Instalime elektrike & hidraulike",
    ],
  },
  {
    title: "Mirëmbajtje & Interier",
    emoji: "🔧",
    items: [
      "Mirëmbajtje shtëpie",
      "Mirëmbajtje oborri",
      "Kopshtari",
      "Krasitje",
      "Mirëmbajtje pishinash",
    ],
  },
  {
    title: "Automjete",
    emoji: "🚗",
    items: [
      "Blerje veture & Rent",
      "Servise",
      "Mekanik",
      "Autolarje",
      "Transport automjetesh",
      "Sigurime",
    ],
  },
  {
    title: "Shërbime ligjore",
    emoji: "⚖️",
    items: [
      "Avokatë",
      "Noterë",
      "Përkthyes të licencuar",
      "Trashëgimi",
      "Kontrata",
      "Çështje pronësore",
    ],
  },
  {
    title: "Financa",
    emoji: "💰",
    items: [
      "Kontabilistë",
      "Konsulentë tatimorë",
      "Sigurime",
      "Këmbim valutor",
    ],
  },
  {
    title: "Teknologji",
    emoji: "💻",
    items: [
      "Zhvillim web",
      "Aplikacione mobile",
      "Instalime rrjeti",
      "Kamera sigurie",
      "Smart Home",
      "Riparim kompjuterësh",
    ],
  },
  {
    title: "Evente & Media",
    emoji: "🎉",
    items: [
      "Sallat e dasmave",
      "Fotografë & Videografë",
      "DJ",
      "Dekorime",
      "Organizim eventesh",
      "Catering",
    ],
  },
];

const categories = categorySections.map((section) => section.title);

const diasporaCountries = [
  { code: "de", label: "Gjermania", angle: 0 },
  { code: "ch", label: "Zvicra", angle: 45 },
  { code: "it", label: "Italia", angle: 90 },
  { code: "gb", label: "Anglia", angle: 135 },
  { code: "se", label: "Suedia", angle: 180 },
  { code: "fr", label: "Franca", angle: 225 },
  { code: "us", label: "SHBA", angle: 270 },
  { code: "tr", label: "Turqia", angle: 315 },
];

// Konturi i saktë i hartës së Kosovës, i nxjerrë (color-key + trace) nga
// harta e artë e flamurit zyrtar. Koordinatat janë në sistemin origjinal
// (kuti rrethuese 98x98, qendër ~127,104); pozicionohet me transform më poshtë.
const kosovoMapPath =
  "M 121.609 55.823 C 121.329 56.276, 119.278 57.248, 117.050 57.983 C 112.510 59.482, 111.727 61.930, 114.915 64.659 C 116.230 65.785, 116.566 66.801, 115.988 67.900 C 115.525 68.780, 114.894 70.309, 114.586 71.297 C 114.279 72.285, 113.458 72.973, 112.763 72.825 C 112.069 72.677, 110.170 73.806, 108.544 75.334 C 106.056 77.671, 105.772 78.405, 106.749 79.970 C 108.365 82.557, 106.773 83.617, 100 84.464 C 95.800 84.990, 93.983 85.769, 92.313 87.763 C 90.343 90.116, 89.795 90.273, 86.785 89.349 C 83.081 88.212, 79.499 89.257, 78.541 91.754 C 77.815 93.645, 79.708 96, 81.956 96 C 84.519 96, 84.790 96.678, 83.988 101.067 C 83.312 104.763, 83.470 105.192, 85.986 106.493 C 88.740 107.917, 90.206 110.578, 91.771 116.993 C 92.513 120.032, 93.107 120.565, 96.339 121.090 C 101.248 121.888, 106.890 126.596, 108.469 131.214 C 109.168 133.256, 109.521 135.145, 109.255 135.411 C 108.989 135.678, 109.773 137.965, 110.998 140.495 C 113.096 144.830, 113.127 145.202, 111.532 146.964 C 109.159 149.587, 110.921 152.665, 114.861 152.777 C 119.519 152.909, 122.206 148.903, 120.613 144.201 C 119.561 141.096, 122.284 137, 125.401 137 C 126.696 137, 128.315 136.325, 129 135.500 C 129.685 134.675, 130.802 134, 131.483 134 C 132.164 134, 134.293 132.933, 136.215 131.629 C 140.248 128.892, 142.144 129.444, 144.526 134.050 C 145.620 136.165, 146.785 137, 148.642 137 C 150.822 137, 151.142 136.650, 150.656 134.793 C 150.269 133.313, 150.923 131.479, 152.640 129.227 C 154.049 127.380, 155.450 126.116, 155.752 126.419 C 156.055 126.721, 156.879 126.188, 157.584 125.234 C 158.611 123.845, 159.117 123.749, 160.133 124.750 C 160.830 125.438, 162.744 126, 164.387 126 L 167.374 126 164.687 123.195 C 161.260 119.618, 161.309 118.699, 165 117.306 C 166.705 116.663, 168 115.443, 168 114.482 C 168 113.551, 169.238 110.925, 170.750 108.645 C 172.262 106.365, 174.108 102.768, 174.851 100.651 C 176.517 95.900, 175.407 94.429, 170.475 94.854 C 168.139 95.055, 166.813 94.675, 166.437 93.698 C 166.105 92.831, 163.827 91.969, 160.811 91.569 L 155.742 90.897 156.352 86.448 C 156.877 82.621, 156.713 82, 155.181 82 C 154.201 82, 152.972 81.594, 152.450 81.097 C 151.928 80.600, 150.600 80.033, 149.500 79.836 C 148.078 79.581, 147.355 78.469, 147 75.989 C 146.619 73.333, 146.022 72.500, 144.500 72.500 C 143.125 72.500, 142.392 71.718, 142.155 70 C 141.771 67.220, 138.417 63.516, 137.552 64.916 C 136.865 66.028, 133.514 65.333, 129.281 63.200 C 127.287 62.196, 126.496 61.311, 127.202 60.875 C 128.016 60.372, 127.858 59.432, 126.648 57.585 C 124.980 55.040, 122.606 54.210, 121.609 55.823 Z";
const kosovoMapCenter = { x: 127, y: 104 };
const kosovoMapScale = 1.7;

const polarPoint = (angleDeg, radius, cx, cy) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
};

const renderFlag = (code) => {
  switch (code) {
    case "de":
      return (
        <>
          <rect width="46" height="30" fill="#000" />
          <rect y="10" width="46" height="10" fill="#DD0000" />
          <rect y="20" width="46" height="10" fill="#FFCE00" />
        </>
      );
    case "ch":
      return (
        <>
          <rect width="46" height="30" fill="#D52B1E" />
          <rect x="19" y="6" width="8" height="18" fill="#fff" />
          <rect x="10" y="12" width="26" height="6" fill="#fff" />
        </>
      );
    case "it":
      return (
        <>
          <rect width="15.33" height="30" fill="#009246" />
          <rect x="15.33" width="15.33" height="30" fill="#fff" />
          <rect x="30.66" width="15.34" height="30" fill="#CE2B37" />
        </>
      );
    case "gb":
      return (
        <>
          <rect width="46" height="30" fill="#fff" />
          <rect x="18" width="10" height="30" fill="#CE1124" />
          <rect y="10" width="46" height="10" fill="#CE1124" />
        </>
      );
    case "se":
      return (
        <>
          <rect width="46" height="30" fill="#006AA7" />
          <rect x="14" width="8" height="30" fill="#FECC00" />
          <rect y="11" width="46" height="8" fill="#FECC00" />
        </>
      );
    case "fr":
      return (
        <>
          <rect width="15.33" height="30" fill="#0055A4" />
          <rect x="15.33" width="15.33" height="30" fill="#fff" />
          <rect x="30.66" width="15.34" height="30" fill="#EF4135" />
        </>
      );
    case "us": {
      const stripeH = 30 / 13;
      return (
        <>
          <rect width="46" height="30" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect
              key={i}
              y={i * stripeH}
              width="46"
              height={stripeH}
              fill="#B22234"
            />
          ))}
          <rect width="18" height={stripeH * 7} fill="#3C3B6E" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={2.5 + col * 4.5}
                cy={2 + row * 5}
                r="0.8"
                fill="#fff"
              />
            )),
          )}
        </>
      );
    }
    case "tr":
      return (
        <>
          <rect width="46" height="30" fill="#E30A17" />
          <circle cx="16" cy="15" r="8" fill="#fff" />
          <circle cx="18.5" cy="15" r="6.4" fill="#E30A17" />
          <circle cx="27" cy="15" r="2.1" fill="#fff" />
        </>
      );
    default:
      return null;
  }
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const formatPrice = (price) => {
  if (!price) return "";
  return String(price).includes("€") ? String(price) : `${price}€`;
};

const getInitialRoute = () => {
  const path = window.location.pathname;
  if (path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
};

const initialPosts = [
  {
    id: "demo-1",
    author: "Agron Krasniqi",
    userType: "business",
    title: "Apartament modern në Gërmi",
    category: "Prona",
    subcategory: "Banesa",
    type: "Shitje",
    description: "2 + 1 me pamje dhe afër zonave rekreative.",
    price: "€79,000",
    photos: [],
    clicks: 128,
  },
  {
    id: "demo-2",
    author: "Fitore Gashi",
    userType: "business",
    title: "Shtëpi familjare në Pejë",
    category: "Prona",
    subcategory: "Shtëpi",
    type: "Shitje",
    description: "Kopsht privat, garazh dhe ambient i qetë.",
    price: "€135,000",
    photos: [],
    clicks: 94,
  },
  {
    id: "demo-3",
    author: "Blerim Hoxha",
    userType: "business",
    title: "Studio në Prizren",
    category: "Prona",
    subcategory: "Banesa",
    type: "Me qira",
    description: "Investim ideal për qira dhe jetë të rehatshme.",
    price: "€49,000",
    photos: [],
    clicks: 76,
  },
  {
    id: "demo-4",
    author: "Driton Rama",
    userType: "business",
    title: "Renovim kuzhine dhe garderobash",
    category: "Mirëmbajtje & Interier",
    subcategory: "Mirëmbajtje shtëpie",
    type: "Abonim mujor",
    description: "Mobilieri me porosi, dizajn modern për shtëpinë tuaj.",
    price: "800€",
    photos: [],
    clicks: 41,
  },
  {
    id: "demo-5",
    author: "Leutrim Berisha",
    userType: "individual",
    title: "Servisim dhe kontroll para blerjes",
    category: "Automjete",
    subcategory: "Servise",
    type: "Shitje",
    description: "Kontroll teknik i plotë përpara blerjes së veturës.",
    price: "50€",
    photos: [],
    clicks: 33,
  },
];

function App() {
  const [route, setRoute] = useState(getInitialRoute());
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = window.localStorage.getItem("eDiasporaUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    userType: "business",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("pending");
  const [verifyMessage, setVerifyMessage] = useState("Duke verifikuar email-in...");
  const [postForm, setPostForm] = useState({
    title: "",
    category: "",
    subcategory: "",
    customSubcategory: "",
    type: "Shitje",
    description: "",
    price: "",
    photos: [],
  });
  const [posts, setPosts] = useState(initialPosts);
  const [uploadMessage, setUploadMessage] = useState("");

  const [completedWorkForm, setCompletedWorkForm] = useState({
    description: "",
    photos: [],
  });
  const [completedWorks, setCompletedWorks] = useState([]);
  const [completedWorkMessage, setCompletedWorkMessage] = useState("");
  const [completedWorkSubmitting, setCompletedWorkSubmitting] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);

  const [publicProfileUser, setPublicProfileUser] = useState(null);
  const [publicProfileWorks, setPublicProfileWorks] = useState([]);
  const [publicProfileStatus, setPublicProfileStatus] = useState("loading");
  const [publicProfileMessage, setPublicProfileMessage] = useState("");

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", contact: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactTargetId, setContactTargetId] = useState(null);

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState(null);
  const [replyFeedback, setReplyFeedback] = useState({});

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const [dashboardSection, setDashboardSection] = useState("overview");
  const [profileTab, setProfileTab] = useState("personal");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    company: "",
    avatarUrl: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const authHandleChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const { name, email, password, userType, company } = authForm;
    if (!name || !email || !password) {
      setAuthError(true);
      setAuthMessage("Ju lutemi plotësoni të gjitha fushat e regjistrimit.");
      return;
    }

    setAuthSubmitting(true);
    setAuthMessage("");
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, userType, company }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(true);
        setAuthMessage(data.error || "Regjistrimi dështoi.");
        return;
      }

      setAuthForm({ name: "", email: "", password: "", company: "", userType });
      setAuthError(false);
      setUnverifiedEmail(email);
      setAuthMessage(data.message);
    } catch (err) {
      setAuthError(true);
      setAuthMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const { email, password } = authForm;

    setAuthSubmitting(true);
    setAuthMessage("");
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthError(true);
        setAuthMessage(data.error || "Kyçja dështoi.");
        setUnverifiedEmail(data.user && !data.user.isVerified ? email : "");
        return;
      }

      setCurrentUser(data.user);
      window.localStorage.setItem("eDiasporaUser", JSON.stringify(data.user));
      setAuthError(false);
      setUnverifiedEmail("");
      setAuthMessage(data.message);
    } catch (err) {
      setAuthError(true);
      setAuthMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.localStorage.removeItem("eDiasporaUser");
    setAuthError(false);
    setAuthMessage("Jeni çkyçur nga sistemi.");
  };

  const handleResendVerification = async (email) => {
    setAuthSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setAuthError(!response.ok);
      setAuthMessage(data.message || data.error);
    } catch (err) {
      setAuthError(true);
      setAuthMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setForgotSubmitting(true);
    setForgotMessage("");
    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      setForgotMessage(data.message || data.error);
    } catch (err) {
      setForgotMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetFormChange = (event) => {
    const { name, value } = event.target;
    setResetForm((current) => ({ ...current, [name]: value }));
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (resetForm.password.length < 6) {
      setResetError(true);
      setResetMessage("Fjalëkalimi duhet të ketë të paktën 6 shkronja.");
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError(true);
      setResetMessage("Fjalëkalimet nuk përputhen.");
      return;
    }

    const token = new URLSearchParams(window.location.search).get("token");
    setResetSubmitting(true);
    setResetMessage("");
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: resetForm.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResetError(true);
        setResetMessage(data.error);
        return;
      }

      setResetError(false);
      setResetMessage(data.message);
      setResetDone(true);
    } catch (err) {
      setResetError(true);
      setResetMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const openProfileSection = () => {
    setProfileForm({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      company: currentUser.company || "",
      avatarUrl: currentUser.avatarUrl || "",
    });
    setProfileMessage("");
    setDashboardSection("profile");
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const resizeImageFile = (file, maxSize = 320) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await resizeImageFile(file);
      setProfileForm((current) => ({ ...current, avatarUrl: dataUrl }));
    } catch (err) {
      setProfileError(true);
      setProfileMessage("Nuk u arrit ngarkimi i fotos. Provo një foto tjetër.");
    }
  };

  const handleCompletedWorkChange = (event) => {
    const { name, value } = event.target;
    setCompletedWorkForm((current) => ({ ...current, [name]: value }));
  };

  const handleCompletedWorkPhotosChange = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    if (files.length === 0) return;

    try {
      const dataUrls = await Promise.all(
        files.map((file) => resizeImageFile(file, 640)),
      );
      setCompletedWorkForm((current) => ({ ...current, photos: dataUrls }));
    } catch (err) {
      setCompletedWorkMessage("Nuk u arrit ngarkimi i fotove. Provo përsëri.");
    }
  };

  const handleCompletedWorkSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      setCompletedWorkMessage("Ju duhet të hyni për të postuar.");
      return;
    }

    if (!currentUser.isVerified) {
      setCompletedWorkMessage("Ju lutemi verifikoni email-in para se të publikoni.");
      return;
    }

    if (!completedWorkForm.description || completedWorkForm.photos.length === 0) {
      setCompletedWorkMessage("Shtoni të paktën një foto dhe përshkrimin e punës.");
      return;
    }

    setCompletedWorkSubmitting(true);
    setCompletedWorkMessage("");
    try {
      const response = await fetch(`${API_URL}/api/completed-works`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          description: completedWorkForm.description,
          photos: completedWorkForm.photos,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setCompletedWorkMessage(data.error || "Shtimi i punës dështoi.");
        return;
      }

      setCompletedWorks((current) => [data.work, ...current]);
      setCompletedWorkForm({ description: "", photos: [] });
      setCompletedWorkMessage(data.message);
    } catch (err) {
      setCompletedWorkMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setCompletedWorkSubmitting(false);
    }
  };

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (!contactTargetId) return;

    if (!contactForm.name || !contactForm.contact || !contactForm.message) {
      setContactMessage("Ju lutemi plotësoni emrin, kontaktin dhe mesazhin.");
      return;
    }

    setContactSubmitting(true);
    setContactMessage("");
    try {
      const response = await fetch(
        `${API_URL}/api/users/${contactTargetId}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactForm),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setContactMessage(data.error || "Dërgimi i mesazhit dështoi.");
        return;
      }

      setContactForm({ name: "", contact: "", message: "" });
      setContactMessage(data.message);
    } catch (err) {
      setContactMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleReplyChange = (messageId, value) => {
    setReplyDrafts((current) => ({ ...current, [messageId]: value }));
  };

  const handleReplySubmit = (messageId) => async (event) => {
    event.preventDefault();
    const reply = replyDrafts[messageId];

    if (!reply) {
      setReplyFeedback((current) => ({
        ...current,
        [messageId]: "Shkruaj një përgjigje para se ta dërgosh.",
      }));
      return;
    }

    setReplySubmittingId(messageId);
    setReplyFeedback((current) => ({ ...current, [messageId]: "" }));
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, reply }),
      });
      const data = await response.json();

      if (!response.ok) {
        setReplyFeedback((current) => ({
          ...current,
          [messageId]: data.error || "Dërgimi i përgjigjes dështoi.",
        }));
        return;
      }

      setMessages((current) =>
        current.map((msg) => (msg.id === messageId ? data.contactMessage : msg)),
      );
      setReplyDrafts((current) => ({ ...current, [messageId]: "" }));
      setReplyFeedback((current) => ({ ...current, [messageId]: data.message }));
    } catch (err) {
      setReplyFeedback((current) => ({
        ...current,
        [messageId]: "Nuk u arrit lidhja me serverin. Provoni përsëri.",
      }));
    } finally {
      setReplySubmittingId(null);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSubmitting(true);
    setProfileMessage("");
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, ...profileForm }),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileError(true);
        setProfileMessage(data.error || "Përditësimi dështoi.");
        return;
      }

      setCurrentUser(data.user);
      window.localStorage.setItem("eDiasporaUser", JSON.stringify(data.user));
      setProfileError(false);
      setProfileMessage(data.message);
    } catch (err) {
      setProfileError(true);
      setProfileMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePostChange = (event) => {
    const { name, value } = event.target;
    setPostForm((current) => {
      if (name === "category") {
        return {
          ...current,
          category: value,
          subcategory: "",
          customSubcategory: "",
        };
      }
      if (name === "subcategory" && value !== "Tjetër") {
        return { ...current, subcategory: value, customSubcategory: "" };
      }
      return { ...current, [name]: value };
    });
  };

  const handlePhotoChange = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    if (files.length === 0) return;

    try {
      const dataUrls = await Promise.all(
        files.map((file) => resizeImageFile(file, 640)),
      );
      setPostForm((current) => ({ ...current, photos: dataUrls }));
    } catch (err) {
      setUploadMessage("Nuk u arrit ngarkimi i fotove. Provo përsëri.");
    }
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      setUploadMessage("Ju duhet të hyni për të postuar.");
      return;
    }

    if (!currentUser.isVerified) {
      setUploadMessage("Ju lutemi verifikoni email-in para se të publikoni.");
      return;
    }

    if (!postForm.title || !postForm.description || !postForm.price) {
      setUploadMessage("Ju lutemi plotësoni titullin, përshkrimin dhe çmimin.");
      return;
    }

    if (!postForm.category) {
      setUploadMessage("Ju lutemi zgjidhni kategorinë.");
      return;
    }

    if (!postForm.subcategory) {
      setUploadMessage("Ju lutemi zgjidhni nën-kategorinë.");
      return;
    }

    if (postForm.subcategory === "Tjetër" && !postForm.customSubcategory) {
      setUploadMessage("Ju lutemi shkruani nënkategorinë tuaj.");
      return;
    }

    const resolvedSubcategory =
      postForm.subcategory === "Tjetër"
        ? postForm.customSubcategory
        : postForm.subcategory;

    setPostSubmitting(true);
    setUploadMessage("");
    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          title: postForm.title,
          category: postForm.category,
          subcategory: resolvedSubcategory,
          type: postForm.type,
          description: postForm.description,
          price: postForm.price,
          photos: postForm.photos,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setUploadMessage(data.error || "Postimi dështoi.");
        return;
      }

      setPosts((current) => [data.post, ...current]);
      setPostForm({
        title: "",
        category: "",
        subcategory: "",
        customSubcategory: "",
        type: "Shitje",
        description: "",
        price: "",
        photos: [],
      });
      setUploadMessage(data.message);
    } catch (err) {
      setUploadMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
    } finally {
      setPostSubmitting(false);
    }
  };

  const handlePostClick = (postId) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, clicks: post.clicks + 1 } : post,
      ),
    );
  };

  const topPosts = [...posts].sort((a, b) => b.clicks - a.clicks).slice(0, 3);

  const currentCategory = categorySections.find(
    (section) => `/${slugify(section.title)}` === route,
  );
  const isCategoryPage = Boolean(currentCategory);
  const categoryPosts = currentCategory
    ? posts.filter(
        (post) =>
          post.category === currentCategory.title &&
          (!selectedSubcategory || post.subcategory === selectedSubcategory),
      )
    : [];
  const isAuthPage =
    route === "/auth" || route === "/login" || route === "/register";
  const isVerifyPage = route === "/verify";
  const isForgotPasswordPage = route === "/forgot-password";
  const isResetPasswordPage = route === "/reset-password";
  const authMode = route === "/register" ? "register" : "login";
  const profileRouteMatch = route.match(/^\/profili\/(\d+)$/);
  const isProfilePage = Boolean(profileRouteMatch);
  const profileUserId = profileRouteMatch ? Number(profileRouteMatch[1]) : null;
  const postRouteMatch = route.match(/^\/postim\/([^/]+)$/);
  const isPostPage = Boolean(postRouteMatch);
  const postRouteId = postRouteMatch ? postRouteMatch[1] : null;
  const currentPost = isPostPage
    ? posts.find((post) => String(post.id) === postRouteId)
    : null;

  const [pendingScroll, setPendingScroll] = useState(null);
  const [pendingSubcategory, setPendingSubcategory] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const handleNavigate = (path) => {
    if (path === route) return;
    window.history.pushState(null, "", path);
    setRoute(path);
  };

  const handleLinkClick = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  const postCategorySection = currentPost
    ? categorySections.find(
        (section) => section.title === currentPost.category,
      )
    : null;

  const handleBackToPostCategory = () => {
    if (!postCategorySection) {
      handleNavigate("/");
      return;
    }
    setPendingSubcategory(currentPost.subcategory || null);
    handleNavigate(`/${slugify(postCategorySection.title)}`);
  };

  const handleSectionLinkClick = (sectionId) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    if (route !== "/") {
      setPendingScroll(sectionId);
      handleNavigate("/");
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = () => setRoute(getInitialRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    setContactOpen(false);
    setContactForm({ name: "", contact: "", message: "" });
    setContactMessage("");
    setContactTargetId(null);
    setSelectedSubcategory(pendingSubcategory);
    setPendingSubcategory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    if (!pendingScroll || route !== "/") return;
    const id = pendingScroll;
    setPendingScroll(null);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [route, pendingScroll]);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [postRouteId]);

  useEffect(() => {
    if (!isVerifyPage) return;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setVerifyStatus("error");
      setVerifyMessage("Linku i verifikimit është i pavlefshëm.");
      return;
    }

    fetch(`${API_URL}/api/verify?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        setVerifyStatus(response.ok ? "success" : "error");
        setVerifyMessage(data.message || data.error);
      })
      .catch(() => {
        setVerifyStatus("error");
        setVerifyMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
      });
  }, [isVerifyPage]);

  useEffect(() => {
    fetch(`${API_URL}/api/posts`)
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data.posts) || data.posts.length === 0) return;
        setPosts((current) => [...data.posts, ...current]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCompletedWorks([]);
      return;
    }

    fetch(`${API_URL}/api/completed-works?userId=${currentUser.id}`)
      .then((response) => response.json())
      .then((data) => {
        setCompletedWorks(Array.isArray(data.works) ? data.works : []);
      })
      .catch(() => {});
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      return;
    }

    fetch(`${API_URL}/api/messages?email=${encodeURIComponent(currentUser.email)}`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(() => {});
  }, [currentUser?.id]);

  useEffect(() => {
    if (!isProfilePage) return;

    setPublicProfileStatus("loading");
    setPublicProfileUser(null);
    setPublicProfileWorks([]);

    Promise.all([
      fetch(`${API_URL}/api/users/${profileUserId}/public`).then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      ),
      fetch(`${API_URL}/api/completed-works?userId=${profileUserId}`).then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      ),
    ])
      .then(([userResult, worksResult]) => {
        if (!userResult.ok) {
          setPublicProfileStatus("error");
          setPublicProfileMessage(
            userResult.data.error || "Profili nuk u gjet.",
          );
          return;
        }

        setPublicProfileUser(userResult.data.user);
        setPublicProfileWorks(worksResult.ok ? worksResult.data.works || [] : []);
        setPublicProfileStatus("success");
      })
      .catch(() => {
        setPublicProfileStatus("error");
        setPublicProfileMessage("Nuk u arrit lidhja me serverin. Provoni përsëri.");
      });
  }, [isProfilePage, profileUserId]);

  const contactFormPanel = (
    <div className="auth-grid">
      <div className="auth-card contact-card">
        <h3 className="auth-panel-title">Dërgo një ofertë</h3>
        <form onSubmit={handleContactSubmit} className="registration-form">
          <label>
            Emri yt
            <input
              name="name"
              value={contactForm.name}
              onChange={handleContactChange}
              placeholder="Emri yt"
            />
          </label>
          <label>
            Email ose telefon
            <input
              name="contact"
              value={contactForm.contact}
              onChange={handleContactChange}
              placeholder="email@shembull.com ose +383 4X XXX XXX"
            />
          </label>
          <label>
            Mesazhi / oferta
            <textarea
              name="message"
              value={contactForm.message}
              onChange={handleContactChange}
              rows="4"
              placeholder="Shkruaj ofertën ose pyetjen tënde"
            />
          </label>
          <button
            type="submit"
            className="button button-primary"
            disabled={contactSubmitting}
          >
            {contactSubmitting ? "Duke dërguar..." : "Dërgo mesazhin"}
          </button>
          {contactMessage && <p className="form-message">{contactMessage}</p>}
        </form>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className={`container header-inner${currentUser ? " header-inner-centered" : ""}`}>
          <a href="/" className="logo" onClick={handleLinkClick("/")}>
            <svg
              className="logo-mark"
              viewBox="0 0 98 98"
              role="img"
              aria-label="Harta e Kosovës"
            >
              <path d={kosovoMapPath} transform="translate(-78, -55)" />
            </svg>
            <span className="logo-text">
              <span className="logo-e">e</span>Diaspora
            </span>
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Mbyll menynë" : "Hap menynë"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className={`main-nav ${menuOpen ? "main-nav-open" : ""}`}>
            {currentUser ? null : (
              <>
                <a
                  href="/"
                  onClick={(event) => {
                    handleLinkClick("/")(event);
                    setMenuOpen(false);
                  }}
                >
                  Ballina
                </a>
                <a href="/#categories" onClick={handleSectionLinkClick("categories")}>
                  Kategoritë
                </a>
                <a href="/#about" onClick={handleSectionLinkClick("about")}>
                  Rreth nesh
                </a>
                <a href="/#testimonials" onClick={handleSectionLinkClick("testimonials")}>
                  Përshtypjet
                </a>
                <span className="main-nav-divider" aria-hidden="true"></span>
                <a
                  href="/login"
                  className="button button-secondary"
                  onClick={(event) => {
                    handleLinkClick("/login")(event);
                    setMenuOpen(false);
                  }}
                >
                  Kyçu
                </a>
                <a
                  href="/register"
                  className="button button-primary"
                  onClick={(event) => {
                    handleLinkClick("/register")(event);
                    setMenuOpen(false);
                  }}
                >
                  Regjistrohu
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {!isVerifyPage &&
          !isAuthPage &&
          !isCategoryPage &&
          !isForgotPasswordPage &&
          !isResetPasswordPage &&
          !isProfilePage &&
          !isPostPage && (
        <section className="hero" id="home">
          <div className="container hero-content">
            <div>
              <p className="eyebrow">Lidhja juaj me Kosovën</p>
              <h1>Platforma për diasporën dhe bizneset që shërbejnë Kosovën</h1>
              <p className="hero-copy">
                Regjistro biznesin tuaj ose gjej pronën dhe shërbimin e duhur në
                Kosovë - të gjitha në një vend.
              </p>
              <div className="hero-actions">
                <a href="/register" className="button button-primary">
                  Regjistro Biznesin
                </a>
              </div>
            </div>
            <div className="hero-card">
              <div className="diaspora-card">
                <svg
                  className="diaspora-map"
                  viewBox="0 0 520 520"
                  role="img"
                  aria-label="Harta e Kosovës me shigjeta nga vendet e diasporës: Gjermani, Zvicër, Itali, Angli, Suedi, Francë, SHBA, Turqi"
                >
                  <defs>
                    <marker
                      id="diaspora-arrowhead"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M0,0 L10,5 L0,10 Z" fill="#111" />
                    </marker>
                  </defs>

                  <g stroke="#111" strokeWidth="2.5" fill="none">
                    {diasporaCountries.map((country) => {
                      const start = polarPoint(country.angle, 190, 260, 260);
                      const end = polarPoint(country.angle, 150, 260, 260);
                      return (
                        <line
                          key={`arrow-${country.code}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          markerEnd="url(#diaspora-arrowhead)"
                        />
                      );
                    })}
                  </g>

                  <path
                    d={kosovoMapPath}
                    fill="#c9922f"
                    transform={`translate(260, 260) scale(${kosovoMapScale}) translate(${-kosovoMapCenter.x}, ${-kosovoMapCenter.y})`}
                  />

                  {diasporaCountries.map((country) => {
                    const pos = polarPoint(country.angle, 220, 260, 260);
                    return (
                      <g
                        key={`flag-${country.code}`}
                        transform={`translate(${pos.x - 23}, ${pos.y - 15})`}
                      >
                        <clipPath id={`flag-clip-${country.code}`}>
                          <rect width="46" height="30" rx="4" ry="4" />
                        </clipPath>
                        <g clipPath={`url(#flag-clip-${country.code})`}>
                          {renderFlag(country.code)}
                        </g>
                        <rect
                          width="46"
                          height="30"
                          rx="4"
                          ry="4"
                          fill="none"
                          stroke="rgba(17, 24, 39, 0.18)"
                        />
                      </g>
                    );
                  })}
                </svg>
                <p className="diaspora-caption">
                  <span className="logo-e">e</span>
                  <span className="diaspora-caption-brand">Diaspora</span> -
                  BASHKON SHQIPTARËT
                </p>
              </div>
            </div>
          </div>
        </section>
        )}

        {isVerifyPage ? (
          <section className="auth-panel-section container" id="verify">
            <div className="verify-card">
              <h2>
                {verifyStatus === "success"
                  ? "Email-i u verifikua"
                  : verifyStatus === "error"
                    ? "Verifikimi dështoi"
                    : "Verifikimi i email-it"}
              </h2>
              <p>{verifyMessage}</p>
              {verifyStatus === "success" && (
                <a
                  href="/login"
                  className="button button-primary"
                  onClick={handleLinkClick("/login")}
                >
                  Shko te Hyrja
                </a>
              )}
            </div>
          </section>
        ) : isForgotPasswordPage ? (
          <section className="auth-panel-section container" id="forgot-password">
            <div className="auth-card">
              <h2 className="auth-panel-title">Harrove fjalëkalimin?</h2>
              <p className="auth-panel-subtitle">
                Vendos email-in tënd dhe do të të dërgojmë një link për të
                rivendosur fjalëkalimin.
              </p>
              <form onSubmit={handleForgotPassword} className="registration-form">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="email@shembull.com"
                  />
                </label>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={forgotSubmitting}
                >
                  {forgotSubmitting ? "Duke dërguar..." : "Dërgo linkun"}
                </button>
              </form>
              {forgotMessage && <p className="form-message">{forgotMessage}</p>}
              <a href="/login" className="auth-panel-link">
                Kthehu te hyrja
              </a>
            </div>
          </section>
        ) : isResetPasswordPage ? (
          <section className="auth-panel-section container" id="reset-password">
            <div className="auth-card">
              <h2 className="auth-panel-title">Rivendos fjalëkalimin</h2>
              {resetDone ? (
                <>
                  <p className="auth-panel-subtitle">{resetMessage}</p>
                  <a href="/login" className="button button-primary">
                    Shko te Hyrja
                  </a>
                </>
              ) : (
                <>
                  <form onSubmit={handleResetPassword} className="registration-form">
                    <label>
                      Fjalëkalimi i ri
                      <input
                        type="password"
                        name="password"
                        value={resetForm.password}
                        onChange={handleResetFormChange}
                        placeholder="Të paktën 6 shkronja"
                      />
                    </label>
                    <label>
                      Përsërit fjalëkalimin
                      <input
                        type="password"
                        name="confirmPassword"
                        value={resetForm.confirmPassword}
                        onChange={handleResetFormChange}
                        placeholder="Përsërit fjalëkalimin"
                      />
                    </label>
                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={resetSubmitting}
                    >
                      {resetSubmitting ? "Duke ruajtur..." : "Ruaj fjalëkalimin"}
                    </button>
                  </form>
                  {resetMessage && (
                    <p
                      className={
                        resetError ? "form-message form-message-error" : "form-message"
                      }
                    >
                      {resetMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        ) : isAuthPage ? (
          <section
            className={currentUser ? "dashboard-section container" : "auth-panel-section container"}
            id="auth"
          >
            {currentUser ? (
              <div className="dashboard-panel">
                <div className="dashboard-topbar">
                  <div className="dashboard-user">
                    <div className="account-avatar account-avatar-sm">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} />
                      ) : (
                        <span>{currentUser.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <strong>{currentUser.name}</strong>
                      <span className="dashboard-user-type">
                        {currentUser.userType === "business" ? "Biznes" : "Individ"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleLogout}
                  >
                    Dil
                  </button>
                </div>

                <div className="dashboard-body">
                  <nav className="dashboard-sidebar">
                    <button
                      type="button"
                      className={
                        dashboardSection === "overview"
                          ? "dashboard-nav-item active"
                          : "dashboard-nav-item"
                      }
                      onClick={() => setDashboardSection("overview")}
                    >
                      Përmbledhje
                    </button>
                    <button
                      type="button"
                      className={
                        dashboardSection === "profile"
                          ? "dashboard-nav-item active"
                          : "dashboard-nav-item"
                      }
                      onClick={openProfileSection}
                    >
                      Profili im
                    </button>
                    <button
                      type="button"
                      className={
                        dashboardSection === "posts"
                          ? "dashboard-nav-item active"
                          : "dashboard-nav-item"
                      }
                      onClick={() => setDashboardSection("posts")}
                    >
                      Postim i ri
                    </button>
                    <button
                      type="button"
                      className={
                        dashboardSection === "completed-works"
                          ? "dashboard-nav-item active"
                          : "dashboard-nav-item"
                      }
                      onClick={() => setDashboardSection("completed-works")}
                    >
                      Punët e kryera
                    </button>
                    <button
                      type="button"
                      className={
                        dashboardSection === "messages"
                          ? "dashboard-nav-item active"
                          : "dashboard-nav-item"
                      }
                      onClick={() => setDashboardSection("messages")}
                    >
                      Mesazhet
                    </button>
                  </nav>

                  <div className="dashboard-content">
                    {dashboardSection === "overview" && (
                      <div className="dashboard-overview">
                        <h3>Mirë se erdhe, {currentUser.name}</h3>
                        <p>Email: {currentUser.email}</p>
                        {currentUser.phone && <p>Telefoni: {currentUser.phone}</p>}
                        {currentUser.address && <p>Adresa: {currentUser.address}</p>}
                        {currentUser.company && <p>Kompania: {currentUser.company}</p>}
                        <p>
                          Status:{" "}
                          <strong>
                            {currentUser.isVerified ? "Verifikuar" : "Jo verifikuar"}
                          </strong>
                        </p>
                        {!currentUser.isVerified && (
                          <button
                            type="button"
                            className="button button-primary"
                            disabled={authSubmitting}
                            onClick={() => handleResendVerification(currentUser.email)}
                          >
                            Ridërgo email-in e verifikimit
                          </button>
                        )}
                      </div>
                    )}

                    {dashboardSection === "profile" && (
                      <div>
                        <div className="dashboard-tabs">
                          <button
                            type="button"
                            className={
                              profileTab === "personal"
                                ? "dashboard-tab active"
                                : "dashboard-tab"
                            }
                            onClick={() => setProfileTab("personal")}
                          >
                            Informata Personale
                          </button>
                          <button
                            type="button"
                            className={
                              profileTab === "contact"
                                ? "dashboard-tab active"
                                : "dashboard-tab"
                            }
                            onClick={() => setProfileTab("contact")}
                          >
                            Kontaktet
                          </button>
                          <button
                            type="button"
                            className={
                              profileTab === "photo" ? "dashboard-tab active" : "dashboard-tab"
                            }
                            onClick={() => setProfileTab("photo")}
                          >
                            Foto
                          </button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                          {profileTab === "personal" && (
                            <>
                              <label>
                                Emri
                                <input
                                  name="name"
                                  value={profileForm.name}
                                  onChange={handleProfileChange}
                                />
                              </label>
                              <label>
                                Lloji i llogarisë
                                <input value={currentUser.userType} disabled />
                              </label>
                              {currentUser.userType === "business" && (
                                <label>
                                  Emri i kompanisë
                                  <input
                                    name="company"
                                    value={profileForm.company}
                                    onChange={handleProfileChange}
                                  />
                                </label>
                              )}
                            </>
                          )}

                          {profileTab === "contact" && (
                            <>
                              <label>
                                Email
                                <input value={currentUser.email} disabled />
                              </label>
                              <label>
                                Telefoni
                                <input
                                  name="phone"
                                  value={profileForm.phone}
                                  onChange={handleProfileChange}
                                  placeholder="+383 4X XXX XXX"
                                />
                              </label>
                              <label>
                                Adresa
                                <input
                                  name="address"
                                  value={profileForm.address}
                                  onChange={handleProfileChange}
                                  placeholder="Qyteti, rruga"
                                />
                              </label>
                            </>
                          )}

                          {profileTab === "photo" && (
                            <>
                              <div className="account-avatar account-avatar-lg">
                                {profileForm.avatarUrl ? (
                                  <img src={profileForm.avatarUrl} alt="Parapamje e fotos" />
                                ) : (
                                  <span>{currentUser.name?.charAt(0)?.toUpperCase()}</span>
                                )}
                              </div>
                              <label>
                                Foto e profilit
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarChange}
                                />
                              </label>
                            </>
                          )}

                          <button
                            type="submit"
                            className="button button-primary"
                            disabled={profileSubmitting}
                          >
                            {profileSubmitting ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                          </button>
                        </form>

                        {profileMessage && (
                          <p
                            className={
                              profileError
                                ? "form-message form-message-error"
                                : "form-message"
                            }
                          >
                            {profileMessage}
                          </p>
                        )}
                      </div>
                    )}

                    {dashboardSection === "posts" && (
                      <div>
                        <div className="post-form-card">
                          <h4>Postoni ofertën tuaj</h4>
                          <p>
                            Pas verifikimit të email-it, mund të ngarkoni foto dhe
                            informacion.
                          </p>
                          <form onSubmit={handlePostSubmit}>
                            <label>
                              Titulli
                              <input
                                name="title"
                                value={postForm.title}
                                onChange={handlePostChange}
                                placeholder="Titulli"
                              />
                            </label>
                            <label>
                              Kategoria
                              <select
                                name="category"
                                value={postForm.category}
                                onChange={handlePostChange}
                              >
                                <option value="" disabled>
                                  Zgjedh kategorinë
                                </option>
                                {categories.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Nënkategoria
                              <select
                                name="subcategory"
                                value={postForm.subcategory}
                                onChange={handlePostChange}
                              >
                                <option value="" disabled>
                                  Zgjedh nën-kategorinë
                                </option>
                                {(
                                  categorySections.find(
                                    (section) => section.title === postForm.category,
                                  )?.items || []
                                ).map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                                <option value="Tjetër">Tjetër</option>
                              </select>
                            </label>
                            {postForm.subcategory === "Tjetër" && (
                              <label>
                                Specifiko nënkategorinë
                                <input
                                  name="customSubcategory"
                                  value={postForm.customSubcategory}
                                  onChange={handlePostChange}
                                  placeholder="Shkruaj nënkategorinë tënde"
                                />
                              </label>
                            )}
                            <label>
                              Lloji i ofertës
                              <select
                                name="type"
                                value={postForm.type}
                                onChange={handlePostChange}
                              >
                                <option value="Shitje">Shitje</option>
                                <option value="Me qira">Me qira</option>
                                <option value="Abonim mujor">Abonim mujor</option>
                              </select>
                            </label>
                            <label>
                              Përshkrimi
                              <textarea
                                name="description"
                                value={postForm.description}
                                onChange={handlePostChange}
                                rows="4"
                                placeholder="Përshkrimi i shërbimit ose pronës"
                              />
                            </label>
                            <label>
                              Çmimi
                              <div className="price-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  name="price"
                                  value={postForm.price}
                                  onChange={handlePostChange}
                                  placeholder="P.sh. 1200"
                                />
                                <span>€</span>
                              </div>
                            </label>
                            <label>
                              Fotot (maksimumi 5)
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoChange}
                              />
                            </label>
                            <button
                              type="submit"
                              className="button button-primary"
                              disabled={postSubmitting}
                            >
                              {postSubmitting ? "Duke publikuar..." : "Publiko ofertën"}
                            </button>
                            {uploadMessage && (
                              <p className="form-message">{uploadMessage}</p>
                            )}
                          </form>
                        </div>

                        <div className="posts-list">
                          <h4>Postimet e mia</h4>
                          {posts.filter((post) => post.userId === currentUser.id)
                            .length > 0 ? (
                            posts
                              .filter((post) => post.userId === currentUser.id)
                              .map((post) => (
                                <article key={post.id} className="business-card">
                                  <div>
                                    {post.photos && post.photos.length > 0 && (
                                      <div className="completed-work-preview">
                                        {post.photos.map((photo, index) => (
                                          <img key={index} src={photo} alt={post.title} />
                                        ))}
                                      </div>
                                    )}
                                    <h4>{post.title}</h4>
                                    <p className="business-meta">
                                      {post.category} • {post.subcategory} • {post.type}
                                    </p>
                                    <p>{post.description}</p>
                                    <p className="business-meta">Çmimi: {formatPrice(post.price)}</p>
                                  </div>
                                </article>
                              ))
                          ) : (
                            <p>Nuk ka postime të regjistruara ende.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {dashboardSection === "completed-works" && (
                      <div>
                        <div className="post-form-card">
                          <h4>Shto një punë të kryer</h4>
                          <p>Ngarkoni deri në 5 foto dhe shpjegoni punën e kryer.</p>
                          <form onSubmit={handleCompletedWorkSubmit}>
                            <label>
                              Fotot (maksimumi 5)
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleCompletedWorkPhotosChange}
                              />
                            </label>
                            {completedWorkForm.photos.length > 0 && (
                              <div className="completed-work-preview">
                                {completedWorkForm.photos.map((photo, index) => (
                                  <img key={index} src={photo} alt="Parapamje e punës" />
                                ))}
                              </div>
                            )}
                            <label>
                              Përshkrimi
                              <textarea
                                name="description"
                                value={completedWorkForm.description}
                                onChange={handleCompletedWorkChange}
                                rows="4"
                                placeholder="Shpjegoni punën e kryer"
                              />
                            </label>
                            <button
                              type="submit"
                              className="button button-primary"
                              disabled={completedWorkSubmitting}
                            >
                              {completedWorkSubmitting ? "Duke publikuar..." : "Publiko punën"}
                            </button>
                            {completedWorkMessage && (
                              <p className="form-message">{completedWorkMessage}</p>
                            )}
                          </form>
                        </div>

                        <div className="completed-works-list">
                          <h4>Punët e kryera</h4>
                          {completedWorks.filter((work) => work.userId === currentUser.id)
                            .length > 0 ? (
                            <div className="completed-works-row">
                              {completedWorks
                                .filter((work) => work.userId === currentUser.id)
                                .map((work) => (
                                  <article key={work.id} className="completed-work-card">
                                    <div className="completed-work-preview">
                                      {work.photos.map((photo, index) => (
                                        <img key={index} src={photo} alt="Foto e punës" />
                                      ))}
                                    </div>
                                    <p>{work.description}</p>
                                  </article>
                                ))}
                            </div>
                          ) : (
                            <p>Nuk ka punë të kryera të shtuara ende.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {dashboardSection === "messages" && (
                      <div className="messages-list">
                        <h4>Mesazhet</h4>
                        {messages.length > 0 ? (
                          messages.map((msg) => (
                            <article key={msg.id} className="message-card">
                              <div className="message-card-header">
                                <strong>{msg.senderName}</strong>
                                <span className="business-meta">{msg.senderContact}</span>
                              </div>
                              <p>{msg.message}</p>

                              {msg.reply ? (
                                <div className="message-reply">
                                  <p className="business-meta">Përgjigja jote:</p>
                                  <p>{msg.reply}</p>
                                </div>
                              ) : (
                                <form
                                  onSubmit={handleReplySubmit(msg.id)}
                                  className="message-reply-form"
                                >
                                  <textarea
                                    rows="3"
                                    value={replyDrafts[msg.id] || ""}
                                    onChange={(event) =>
                                      handleReplyChange(msg.id, event.target.value)
                                    }
                                    placeholder="Shkruaj një përgjigje..."
                                  />
                                  <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={replySubmittingId === msg.id}
                                  >
                                    {replySubmittingId === msg.id
                                      ? "Duke dërguar..."
                                      : "Përgjigju"}
                                  </button>
                                  {replyFeedback[msg.id] && (
                                    <p className="form-message">{replyFeedback[msg.id]}</p>
                                  )}
                                </form>
                              )}
                            </article>
                          ))
                        ) : (
                          <p>Nuk ke ende mesazhe.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-grid">
              <div className="auth-card">
                <div className="auth-tabs">
                  <a
                    href="/login"
                    className={
                      authMode === "login"
                        ? "button button-primary"
                        : "button button-secondary"
                    }
                  >
                    Kyçu
                  </a>
                  <a
                    href="/register"
                    className={
                      authMode === "register"
                        ? "button button-primary"
                        : "button button-secondary"
                    }
                  >
                    Regjistrohu
                  </a>
                </div>

                {authMode === "register" ? (
                  <form onSubmit={handleRegister} className="registration-form">
                    <label>
                      Emri i plotë
                      <input
                        name="name"
                        value={authForm.name}
                        onChange={authHandleChange}
                        placeholder="P.sh. Arben Berisha"
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={authForm.email}
                        onChange={authHandleChange}
                        placeholder="email@shembull.com"
                      />
                    </label>
                    <label>
                      Fjalëkalimi
                      <input
                        type="password"
                        name="password"
                        value={authForm.password}
                        onChange={authHandleChange}
                        placeholder="Fjalëkalim"
                      />
                    </label>
                    <label>
                      Lloji i llogarisë
                      <select
                        name="userType"
                        value={authForm.userType}
                        onChange={authHandleChange}
                      >
                        <option value="business">Biznes</option>
                        <option value="individual">Individual</option>
                      </select>
                    </label>
                    {authForm.userType === "business" && (
                      <label>
                        Emri i kompanisë
                        <input
                          name="company"
                          value={authForm.company}
                          onChange={authHandleChange}
                          placeholder="P.sh. Firma Imake"
                        />
                      </label>
                    )}
                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={authSubmitting}
                    >
                      {authSubmitting ? "Duke regjistruar..." : "Krijo llogari falas"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="registration-form">
                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={authForm.email}
                        onChange={authHandleChange}
                        placeholder="email@shembull.com"
                      />
                    </label>
                    <label>
                      Fjalëkalimi
                      <input
                        type="password"
                        name="password"
                        value={authForm.password}
                        onChange={authHandleChange}
                        placeholder="Fjalëkalim"
                      />
                    </label>
                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={authSubmitting}
                    >
                      {authSubmitting ? "Duke u kyçur..." : "Kyçu"}
                    </button>
                    <a href="/forgot-password" className="auth-panel-link">
                      Harrove fjalëkalimin?
                    </a>
                  </form>
                )}

                {authMessage && (
                  <p
                    className={
                      authError ? "form-message form-message-error" : "form-message"
                    }
                  >
                    {authMessage}
                  </p>
                )}

                {unverifiedEmail && (
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={authSubmitting}
                    onClick={() => handleResendVerification(unverifiedEmail)}
                  >
                    Ridërgo email-in e verifikimit
                  </button>
                )}
              </div>
              </div>
            )}
          </section>

        ) : isCategoryPage ? (
          <section className="category-page container">
            <div className="section-header">
              <div>
                <p className="eyebrow">Kategoria</p>
                <h2>
                  {currentCategory.emoji} {currentCategory.title}
                </h2>
                <p>
                  Shiko të gjitha nënkategoritë dhe shërbimet në këtë kategori.
                </p>
              </div>
              <a
                href="/"
                onClick={handleLinkClick("/")}
                className="button button-secondary"
              >
                Kthehu në fillim
              </a>
            </div>

            <div className="subcategory-row">
              {currentCategory.items.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    selectedSubcategory === item
                      ? "subcategory-pill active"
                      : "subcategory-pill"
                  }
                  onClick={() =>
                    setSelectedSubcategory((current) =>
                      current === item ? null : item,
                    )
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="section-header">
              <div>
                <p className="eyebrow">Postimet</p>
                <h2>
                  Ofertat në {selectedSubcategory || currentCategory.title}
                </h2>
              </div>
              {selectedSubcategory && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  Hiq filtrin
                </button>
              )}
            </div>

            {categoryPosts.length > 0 ? (
              <div className="post-compact-grid">
                {categoryPosts.map((post) => (
                  <article key={post.id} className="post-compact-card">
                    <a
                      href={`/postim/${post.id}`}
                      className="post-compact-thumb"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePostClick(post.id);
                        handleNavigate(`/postim/${post.id}`);
                      }}
                    >
                      {post.photos && post.photos.length > 0 ? (
                        <img src={post.photos[0]} alt={post.title} />
                      ) : (
                        <span aria-hidden="true">{currentCategory.emoji}</span>
                      )}
                    </a>
                    <div className="post-compact-body">
                      <span className="tag tag-sm">{post.subcategory}</span>
                      <a
                        href={`/postim/${post.id}`}
                        className="post-compact-title-link"
                        onClick={(event) => {
                          event.preventDefault();
                          handlePostClick(post.id);
                          handleNavigate(`/postim/${post.id}`);
                        }}
                      >
                        <h4>{post.title}</h4>
                      </a>
                      <p className="post-compact-desc">{post.description}</p>
                      <span className="price price-sm">{formatPrice(post.price)}</span>
                      {post.userId && (
                        <a
                          href={`/profili/${post.userId}`}
                          onClick={handleLinkClick(`/profili/${post.userId}`)}
                          className="post-compact-link"
                        >
                          Shiko profilin
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>Nuk ka ende postime në këtë {selectedSubcategory ? "nënkategori" : "kategori"}.</p>
            )}
          </section>
        ) : isProfilePage ? (
          <section className="category-page container">
            {publicProfileStatus === "loading" ? (
              <p>Duke ngarkuar profilin...</p>
            ) : publicProfileStatus === "error" ? (
              <div className="verify-card">
                <h2>Profili nuk u gjet</h2>
                <p>{publicProfileMessage}</p>
                <a href="/" onClick={handleLinkClick("/")} className="button button-primary">
                  Kthehu në fillim
                </a>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Profili</p>
                    <h2>{publicProfileUser.name}</h2>
                    {publicProfileUser.userType === "business" &&
                      publicProfileUser.company && <p>{publicProfileUser.company}</p>}
                  </div>
                  <div className="profile-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        setContactTargetId(profileUserId);
                        setContactOpen((current) => !current);
                      }}
                    >
                      {contactOpen ? "Mbyll kontaktin" : "Kontakto"}
                    </button>
                    <a
                      href="/"
                      onClick={handleLinkClick("/")}
                      className="button button-secondary"
                    >
                      Kthehu në fillim
                    </a>
                  </div>
                </div>

                {contactOpen && contactFormPanel}

                <div className="completed-works-list">
                  <h4>Punët e kryera</h4>
                  {publicProfileWorks.length > 0 ? (
                    <div className="completed-works-row">
                      {publicProfileWorks.map((work) => (
                        <article key={work.id} className="completed-work-card">
                          <div className="completed-work-preview">
                            {work.photos.map((photo, index) => (
                              <img key={index} src={photo} alt="Foto e punës" />
                            ))}
                          </div>
                          <p>{work.description}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>Ky user nuk ka shtuar ende punë të kryera.</p>
                  )}
                </div>
              </>
            )}
          </section>
        ) : isPostPage ? (
          <section className="category-page container">
            {!currentPost ? (
              <div className="verify-card">
                <h2>Postimi nuk u gjet</h2>
                <a href="/" onClick={handleLinkClick("/")} className="button button-primary">
                  Kthehu në fillim
                </a>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <div>
                    <p className="eyebrow">
                      {currentPost.category} • {currentPost.subcategory}
                    </p>
                    <h2>{currentPost.title}</h2>
                  </div>
                </div>

                <div className="post-detail-layout">
                  <div className="post-detail-media">
                    <button
                      type="button"
                      className="post-detail-back"
                      onClick={handleBackToPostCategory}
                    >
                      ← Kthehu
                    </button>
                    {currentPost.photos && currentPost.photos.length > 0 && (
                      <div className="post-detail-slider">
                        <div className="post-detail-slide">
                          {currentPost.photos.length > 1 && (
                            <button
                              type="button"
                              className="post-detail-slide-arrow post-detail-slide-arrow-prev"
                              aria-label="Foto e mëparshme"
                              onClick={() =>
                                setActivePhotoIndex((current) =>
                                  current === 0
                                    ? currentPost.photos.length - 1
                                    : current - 1,
                                )
                              }
                            >
                              ‹
                            </button>
                          )}
                          <img
                            src={currentPost.photos[activePhotoIndex]}
                            alt={currentPost.title}
                          />
                          {currentPost.photos.length > 1 && (
                            <button
                              type="button"
                              className="post-detail-slide-arrow post-detail-slide-arrow-next"
                              aria-label="Foto tjetër"
                              onClick={() =>
                                setActivePhotoIndex((current) =>
                                  current === currentPost.photos.length - 1
                                    ? 0
                                    : current + 1,
                                )
                              }
                            >
                              ›
                            </button>
                          )}
                        </div>
                        {currentPost.photos.length > 1 && (
                          <div className="post-detail-slide-dots">
                            {currentPost.photos.map((_, index) => (
                              <button
                                type="button"
                                key={index}
                                className={
                                  index === activePhotoIndex
                                    ? "post-detail-slide-dot active"
                                    : "post-detail-slide-dot"
                                }
                                aria-label={`Shko te foto ${index + 1}`}
                                onClick={() => setActivePhotoIndex(index)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="post-detail-info">
                    {currentPost.userId && (
                      <div className="profile-actions post-detail-info-actions">
                        <a
                          href={`/profili/${currentPost.userId}`}
                          onClick={handleLinkClick(`/profili/${currentPost.userId}`)}
                          className="button button-secondary"
                        >
                          Shiko profilin
                        </a>
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => {
                            setContactTargetId(currentPost.userId);
                            setContactOpen((current) => !current);
                          }}
                        >
                          {contactOpen ? "Mbyll kontaktin" : "Kontakto"}
                        </button>
                      </div>
                    )}

                    {contactOpen && contactFormPanel}

                    <div className="post-detail-box">
                      <span className="tag">{currentPost.type}</span>
                      <span className="price">{formatPrice(currentPost.price)}</span>
                      <p className="post-detail-box-desc">{currentPost.description}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <section className="categories container" id="categories">
              <h2>Kategoritë kryesore</h2>
              <div className="category-grid">
                {categorySections.map((section) => (
                  <article key={section.title} className="category-card">
                    <h3>
                      <span aria-hidden="true">{section.emoji}</span>{" "}
                      {section.title}
                    </h3>
                    <a
                      href={`/${slugify(section.title)}`}
                      onClick={handleLinkClick(`/${slugify(section.title)}`)}
                      className="button button-outline"
                    >
                      Shiko kategoritë
                    </a>
                  </article>
                ))}
              </div>
            </section>

        <section className="properties container" id="properties">
          <div className="section-header">
            <div>
              <p className="eyebrow">Më të klikuarat</p>
              <h2>3 postimet më të klikuara nga të gjitha kategoritë</h2>
            </div>
          </div>
          <div className="property-grid">
            {topPosts.map((post) => (
              <article
                key={post.id}
                className="property-card-large property-card-clickable"
                onClick={() => handlePostClick(post.id)}
              >
                <span className="tag">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <span className="price">{formatPrice(post.price)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="about container" id="about">
          <div className="about-grid">
            <div className="about-text-card">
              <p className="eyebrow">Pse ne</p>
              <h2>Një urë e sigurtë për diasporën dhe bizneset lokale</h2>
              <p>
                Ne lidhim diasporën me pronat dhe ofruesit e shërbimeve që janë
                në dispozicion në Kosovë, duke e bërë çdo hap më të thjeshtë dhe
                më të besueshëm.
              </p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <strong>Listime të verifikuara</strong>
                <p>
                  Pronat dhe bizneset me informacione të plota dhe të qarta.
                </p>
              </div>
              <div className="feature-item">
                <strong>Shërbime lokale</strong>
                <p>
                  Rrjet i zgjatur i ofruesve të mirëmbajtjes, instalimeve dhe
                  dekorimit.
                </p>
              </div>
              <div className="feature-item">
                <strong>Asistencë profesionale</strong>
                <p>Mbështetje për dokumente, marrëveshje dhe financim.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials container" id="testimonials">
          <div className="section-header">
            <div>
              <p className="eyebrow">Përshtypjet</p>
              <h2>Çfarë thonë ata që tashmë e përdorin eDiaspora</h2>
            </div>
          </div>
          <div className="testimonial-grid">
            <article className="testimonial-card">
              <p className="testimonial-quote">
                "Falë eDiaspora gjeta shpejt një apartament në Prishtinë pa
                pasur nevojë të udhëtoj nga Gjermania."
              </p>
              <p className="testimonial-author">
                Arben M. <span>— Mynih, Gjermani</span>
              </p>
            </article>
            <article className="testimonial-card">
              <p className="testimonial-quote">
                "Regjistrova biznesin tim të mirëmbajtjes dhe brenda javës
                pata klientët e parë nga diaspora."
              </p>
              <p className="testimonial-author">
                Fatlume K. <span>— Prishtinë, Kosovë</span>
              </p>
            </article>
            <article className="testimonial-card">
              <p className="testimonial-quote">
                "Platforma më lidhi me profesionistë të verifikuar për
                renovimin e shtëpisë së prindërve në Prizren."
              </p>
              <p className="testimonial-author">
                Dritan H. <span>— Cyrih, Zvicër</span>
              </p>
            </article>
          </div>
        </section>
      </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            © 2026 eDiaspora. Një platformë për bizneset dhe investimet në
            Kosovë.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
