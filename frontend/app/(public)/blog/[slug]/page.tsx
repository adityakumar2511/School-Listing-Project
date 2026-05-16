import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type SlugProps = { params: Promise<{ slug: string }> };
type TagColor = "blue" | "amber" | "success";

// ─── Post metadata ────────────────────────────────────────────────────────────

const POST_META: Record<
  string,
  {
    title: string;
    description: string;
    tag: string;
    tagColor: TagColor;
    readTime: string;
    publishedAt: string;
  }
> = {
  "prayagraj-school-admission-guide-2025": {
    title: "School Admission in Prayagraj 2025 — Complete Guide",
    description:
      "Documents, timeline, and fees — everything first-time applicants need to know",
    tag: "Admission Guide",
    tagColor: "blue",
    readTime: "5 min",
    publishedAt: "January 15, 2025",
  },
  "cbse-vs-up-board-prayagraj": {
    title: "CBSE vs UP Board — An Honest Comparison for Prayagraj Parents",
    description:
      "Curriculum, exam pattern, and college admissions — a detailed comparison of both boards to help you decide",
    tag: "Board Comparison",
    tagColor: "amber",
    readTime: "4 min",
    publishedAt: "January 20, 2025",
  },
  "top-hostel-schools-prayagraj": {
    title: "Top Hostel Schools in Prayagraj — Fees and Facilities 2025",
    description:
      "Safe, affordable, and academically strong boarding schools — with detailed fees and facilities",
    tag: "School Reviews",
    tagColor: "success",
    readTime: "6 min",
    publishedAt: "February 1, 2025",
  },
};

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return [
    { slug: "prayagraj-school-admission-guide-2025" },
    { slug: "cbse-vs-up-board-prayagraj" },
    { slug: "top-hostel-schools-prayagraj" },
  ];
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const post = POST_META[slug];
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} | SchoolSetu`,
    description: post.description,
    openGraph: {
      title: `${post.title} | SchoolSetu`,
      description: post.description,
      url: `https://schoolsetu.in/blog/${slug}`,
      type: "article",
    },
  };
}

// ─── Shared components ────────────────────────────────────────────────────────

function ArticleH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-10 font-heading text-[22px] font-semibold text-[#185FA5]">
      {children}
    </h2>
  );
}

function ArticleP({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base leading-[1.8] text-[#55534e]">{children}</p>;
}

function ArticleUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-3 space-y-2 pl-5 text-base leading-[1.8] text-[#55534e] [list-style:disc]">
      {children}
    </ul>
  );
}

function ArticleCta({
  text,
  href,
}: {
  text: string;
  href: string;
}) {
  return (
    <div className="mt-10 rounded-xl bg-[#FAEEDA] px-6 py-6">
      <p className="font-heading text-lg font-bold text-[#633806]">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#EF9F27] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d98e1e]"
      >
        View Schools →
      </Link>
    </div>
  );
}

function ArticleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-5 overflow-x-auto overflow-hidden rounded-xl border border-[#D3D1C7]">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="bg-[#185FA5] text-white">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#55534e]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Article content components ───────────────────────────────────────────────

function ArticleAdmissionGuide() {
  return (
    <div>
      <ArticleH2>Required Documents</ArticleH2>
      <ArticleP>
        Keep these documents ready before submitting the admission form — the list is largely the
        same across all schools in Prayagraj:
      </ArticleP>
      <ArticleUl>
        <li>Aadhaar card — of the child and both parents</li>
        <li>Birth certificate (municipality or hospital issued)</li>
        <li>
          Previous class result or report card (a nursery/playschool progress report is sufficient
          for Class 1)
        </li>
        <li>Transfer Certificate (TC) if the child was previously enrolled at another school</li>
        <li>Passport-size photographs — 4 to 6 (of both the child and parents)</li>
        <li>Residence proof — Aadhaar, ration card, or electricity bill</li>
      </ArticleUl>

      <ArticleH2>Admission Timeline — Typical Schools in Prayagraj</ArticleH2>
      <ArticleTable
        headers={["Month", "What Happens"]}
        rows={[
          ["January – February", "Admission forms are available — visit the school or check their website"],
          ["February – March", "Entrance test or informal interview (mainly for Nursery–Class 3)"],
          ["March – April", "Admission confirmation and seat allotment"],
          ["April – May", "Fee payment and document submission"],
          ["June", "New session begins — attend the orientation day"],
        ]}
      />
      <ArticleP>
        <strong>Note:</strong> CBSE schools typically release forms in January. UP Board schools
        start a bit later. If you begin your search in March, seats may already be taken — early
        planning is essential.
      </ArticleP>

      <ArticleH2>Why You Should Check Fees First</ArticleH2>
      <ArticleP>
        Do not select a school based on monthly fee alone — hidden costs can be significant:
      </ArticleP>
      <ArticleTable
        headers={["Category", "Monthly Fee Range"]}
        rows={[
          ["CBSE private schools (Prayagraj)", "₹3,000 – ₹8,000/month"],
          ["Government-aided schools", "₹200 – ₹500/month"],
          ["ICSE schools", "₹4,000 – ₹9,000/month"],
        ]}
      />
      <ArticleP>
        Also keep these <strong>hidden costs</strong> in mind:
      </ArticleP>
      <ArticleUl>
        <li>
          <strong>Uniform:</strong> ₹1,500 – ₹4,000 (usually purchased from a school-specific
          vendor)
        </li>
        <li>
          <strong>Books:</strong> ₹2,000 – ₹5,000 per year (school-prescribed sets)
        </li>
        <li>
          <strong>Activity / development fee:</strong> ₹500 – ₹2,000/year
        </li>
        <li>
          <strong>Transport:</strong> ₹500 – ₹1,500/month if the school bus is required
        </li>
        <li>
          <strong>Admission fee:</strong> one-time ₹5,000 – ₹25,000 — confirm whether it is
          refundable before paying
        </li>
      </ArticleUl>

      <ArticleH2>Practical Tips for Parents</ArticleH2>
      <ArticleUl>
        <li>
          <strong>Shortlist 2–3 schools</strong> — do not rely on a single school, as seats filling
          up is common
        </li>
        <li>
          <strong>Always visit the school in person</strong> — building condition, classroom size,
          cleanliness, and teacher conduct cannot be assessed online
        </li>
        <li>
          <strong>Talk to current parents</strong> — school Facebook pages and local WhatsApp groups
          are good sources of honest reviews
        </li>
        <li>
          <strong>Ask about the admission fee refund policy</strong> — confirm whether you will be
          reimbursed if you secure a seat at another school
        </li>
        <li>
          <strong>Understand the selection criteria</strong> — some schools use a lottery, some use
          tests, and some use proximity — know this in advance
        </li>
      </ArticleUl>

      <ArticleCta
        text="Compare schools in Prayagraj — fees, board, and facilities all in one place"
        href="/schools/prayagraj"
      />
    </div>
  );
}

function ArticleCBSEvsUP() {
  return (
    <div>
      <ArticleP>
        For parents searching for schools in Prayagraj, the most common dilemma is{" "}
        <strong>CBSE or UP Board?</strong> Both have their own advantages and disadvantages. This
        article honestly compares both to help you make the right decision for your child.
      </ArticleP>

      <ArticleH2>Quick Comparison Table</ArticleH2>
      <ArticleTable
        headers={["Feature", "CBSE", "UP Board"]}
        rows={[
          ["Monthly fees", "₹3,000 – ₹8,000", "₹200 – ₹1,000"],
          ["Medium", "English mainly", "Hindi mainly"],
          ["Syllabus", "NCERT based (national)", "UP State Board"],
          ["JEE / NEET prep", "Better aligned", "Additional coaching required"],
          ["Competition level", "Higher", "Moderate"],
          ["Schools in Prayagraj (SchoolSetu listed)", "3 schools", "1 school"],
          ["Class 10 passing rate", "High (97%+ nationally)", "Improving (80%+)"],
          ["Medium switch risk", "Low", "Hindi medium students can struggle in English college"],
        ]}
      />

      <ArticleH2>Advantages of CBSE</ArticleH2>
      <ArticleUl>
        <li>
          <strong>Nationally recognised</strong> — a CBSE student can transfer to any state in
          India with ease
        </li>
        <li>
          <strong>NCERT curriculum</strong> — builds a strong foundation for IIT JEE, NEET, and
          UPSC
        </li>
        <li>
          <strong>English medium</strong> — better preparation for professional and higher education
        </li>
        <li>
          <strong>Activity-based learning</strong> — focuses on concept building rather than rote
          memorisation
        </li>
      </ArticleUl>

      <ArticleH2>Disadvantages of CBSE</ArticleH2>
      <ArticleUl>
        <li>
          <strong>Higher fees</strong> — ₹3,000 – ₹8,000/month, which may not suit every budget
        </li>
        <li>
          <strong>Peer pressure and competition</strong> — the academic load on children can be
          higher
        </li>
        <li>
          <strong>Less focus on Hindi and local culture</strong> — which matters to some families
        </li>
      </ArticleUl>

      <ArticleH2>Advantages of UP Board</ArticleH2>
      <ArticleUl>
        <li>
          <strong>Very affordable</strong> — ₹200 – ₹1,000/month, and free in government schools
        </li>
        <li>
          <strong>Strong Hindi medium</strong> — children learn confidently in their native language
        </li>
        <li>
          <strong>Ideal for UP government jobs</strong> — builds a strong base for state-level
          competitive exams
        </li>
        <li>
          <strong>Community connection</strong> — curriculum is aligned with local context and
          culture
        </li>
      </ArticleUl>

      <ArticleH2>Disadvantages of UP Board</ArticleH2>
      <ArticleUl>
        <li>
          <strong>Difficult transition to English medium</strong> — language barrier can arise in
          engineering or medical colleges
        </li>
        <li>
          <strong>Tendency towards rote learning</strong> — conceptual clarity can sometimes be
          lower
        </li>
        <li>
          <strong>Limited private school options</strong> — quality UP Board schools are fewer in
          Prayagraj
        </li>
      </ArticleUl>

      <ArticleH2>When to Choose CBSE</ArticleH2>
      <ArticleUl>
        <li>If you plan to relocate to Delhi, Bangalore, or other cities in the future</li>
        <li>
          If the child aims for engineering or medicine (IIT/NEET preparation)
        </li>
        <li>If English-medium education is a priority</li>
        <li>If a budget of ₹3,000+/month is manageable</li>
      </ArticleUl>

      <ArticleH2>When to Choose UP Board</ArticleH2>
      <ArticleUl>
        <li>Budget is limited — quality education is needed at under ₹500/month</li>
        <li>
          The child is comfortable in Hindi medium and local cultural roots are important
        </li>
        <li>The goal is UP government jobs (PCS, TGT, PGT) in the future</li>
        <li>The plan is to settle in Prayagraj and build a local career</li>
      </ArticleUl>

      <ArticleH2>The Situation in Prayagraj</ArticleH2>
      <ArticleP>
        CBSE schools are in high demand in Prayagraj — especially in Civil Lines, Naini, and areas
        around Allahabad University. IIT JEE coaching centres are also more closely aligned with the
        CBSE curriculum. UP Board schools are mostly government and aided institutions that remain
        the best option for budget-conscious families.
      </ArticleP>
      <ArticleP>
        <strong>Bottom line:</strong> If national-level opportunities are the goal, choose CBSE. If
        keeping local roots strong is the priority and the budget is limited, UP Board is an equally
        respectable choice — just plan for additional English coaching from Class 9 onwards.
      </ArticleP>

      <ArticleCta
        text="Compare CBSE schools in Prayagraj — fees, facilities, and admission status"
        href="/schools/prayagraj?board=CBSE"
      />
    </div>
  );
}

function ArticleHostelSchools() {
  return (
    <div>
      <ArticleP>
        Some families in Prayagraj prefer boarding schools for their children — whether for
        distance, better academics, or discipline. This guide covers the top hostel schools in
        Prayagraj in detail.
      </ArticleP>

      <ArticleH2>Naini Residential Academy — Detailed Review</ArticleH2>
      <ArticleTable
        headers={["Detail", "Information"]}
        rows={[
          ["Location", "Naini, Prayagraj (Near Naini Industrial Area)"],
          ["Board", "CBSE"],
          ["Classes", "Class 1 – 12"],
          ["Monthly Fee", "₹5,800/month (inclusive)"],
          ["Hostel Charges", "₹2,000/month extra (food + accommodation)"],
          ["Admission Status", "Open for 2025-26"],
        ]}
      />

      <h3 className="mb-3 mt-6 font-heading text-lg font-semibold text-[#2C2C2A]">
        Hostel Facilities
      </h3>
      <ArticleUl>
        <li>
          <strong>Rooms:</strong> 4-bed dormitory style — clean, well-ventilated, with study tables
        </li>
        <li>
          <strong>Food:</strong> 3 meals + evening snacks — vegetarian, nutritionally balanced menu
        </li>
        <li>
          <strong>Security:</strong> 24/7 CCTV, warden on-site, gated campus
        </li>
        <li>
          <strong>Medical:</strong> Full-time nurse, doctor on call, nearest hospital 2 km
        </li>
        <li>
          <strong>Communication:</strong> Weekly parent call, monthly parent visit day
        </li>
        <li>
          <strong>Weekends:</strong> Supervised outings (once a month), indoor sports on campus
        </li>
      </ArticleUl>

      <h3 className="mb-3 mt-6 font-heading text-lg font-semibold text-[#2C2C2A]">
        Academics
      </h3>
      <ArticleUl>
        <li>CBSE syllabus with extra focus on IIT/NEET foundation from Class 8</li>
        <li>Small batch sizes — max 35 students per class</li>
        <li>Regular weekly tests + parent report every fortnight</li>
        <li>Science labs, smart classroom, library with NCERT + reference books</li>
      </ArticleUl>

      <h3 className="mb-3 mt-6 font-heading text-lg font-semibold text-[#2C2C2A]">
        Contact
      </h3>
      <ArticleP>
        📞 School office: For inquiries, view the{" "}
        <Link
          href="/schools/naini-residential-academy-prayagraj"
          className="font-semibold text-[#185FA5] hover:underline"
        >
          detailed page on SchoolSetu
        </Link>{" "}
        or send a direct WhatsApp message.
      </ArticleP>

      <ArticleH2>What to Look For When Choosing a Hostel School — Checklist</ArticleH2>
      <ArticleP>
        Before finalising any boarding school, make sure to evaluate these points carefully:
      </ArticleP>

      <div className="mt-4 space-y-3">
        {[
          {
            icon: "🏥",
            title: "Medical facility on campus?",
            detail:
              "A full-time nurse is essential. How far is the nearest hospital? Ask the school directly about their emergency protocol.",
          },
          {
            icon: "🍽️",
            title: "Food quality — visit in person to check",
            detail:
              "Try a meal at the canteen during your visit. Check the menu — is there variety or the same food daily? Consider whether the child is vegetarian.",
          },
          {
            icon: "🏠",
            title: "Weekend outing policy",
            detail:
              "Some schools allow children to go home every weekend, others once a month. Decide based on your child's personality and comfort level.",
          },
          {
            icon: "📹",
            title: "CCTV and security",
            detail:
              "Are cameras installed inside the hostel building or only at the gate? Does the warden reside on campus? When are the night rounds conducted?",
          },
          {
            icon: "📱",
            title: "Communication with parents",
            detail:
              "Are weekly calls allowed? Is there an app or portal to track progress? Will you be reachable immediately in an emergency?",
          },
          {
            icon: "👩‍🏫",
            title: "Talk to parents of current boarding students",
            detail:
              "This is the most important step. Brochures always look good — honest feedback only comes from parents whose children are already enrolled.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex gap-4 rounded-xl border border-[#D3D1C7] bg-white p-4"
          >
            <span className="mt-0.5 text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-[#2C2C2A]">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#55534e]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <ArticleH2>Estimate the Total Budget for a Hostel School</ArticleH2>
      <ArticleTable
        headers={["Cost Item", "Approximate Annual Amount"]}
        rows={[
          ["Tuition fee", "₹36,000 – ₹96,000/year"],
          ["Hostel + food", "₹18,000 – ₹30,000/year"],
          ["Admission fee (one-time)", "₹10,000 – ₹25,000"],
          ["Uniform + books", "₹4,000 – ₹8,000/year"],
          ["Pocket money + outings", "₹5,000 – ₹10,000/year"],
          ["Total estimate", "₹73,000 – ₹1,69,000/year"],
        ]}
      />
      <p className="mt-3 text-xs text-[#888780]">
        * These estimates are for mid-range boarding schools in Prayagraj. Costs at premium schools
        may be higher.
      </p>

      <ArticleCta
        text="Compare all hostel schools in Prayagraj — fees, facilities, and admission status"
        href="/schools/category/hostel"
      />
    </div>
  );
}

// ─── Article mapping ──────────────────────────────────────────────────────────

function getArticleContent(slug: string): React.ReactNode {
  switch (slug) {
    case "prayagraj-school-admission-guide-2025":
      return <ArticleAdmissionGuide />;
    case "cbse-vs-up-board-prayagraj":
      return <ArticleCBSEvsUP />;
    case "top-hostel-schools-prayagraj":
      return <ArticleHostelSchools />;
    default:
      return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: SlugProps) {
  const { slug } = await params;
  const post = POST_META[slug];
  if (!post) notFound();

  const content = getArticleContent(slug);

  return (
    <div className="container-shell py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#888780]">
        <Link href="/" className="hover:text-[#185FA5]">
          Home
        </Link>
        <span>›</span>
        <Link href="/blog" className="hover:text-[#185FA5]">
          Blog
        </Link>
        <span>›</span>
        <span className="text-[#2C2C2A]">{post.title}</span>
      </nav>

      {/* Article container */}
      <div className="mx-auto max-w-[720px]">
        {/* Meta */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge tone={post.tagColor}>{post.tag}</Badge>
          <span className="text-sm text-[#888780]">
            {post.readTime} read · {post.publishedAt}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-[36px] font-bold leading-tight text-[#042C53]">
          {post.title}
        </h1>

        {/* Description */}
        <p className="mt-4 text-lg leading-relaxed text-[#55534e]">{post.description}</p>

        {/* Divider */}
        <div className="my-8 border-t border-[#D3D1C7]" />

        {/* Article content */}
        {content}

        {/* Footer links */}
        <div className="mt-14 flex flex-wrap gap-4 border-t border-[#D3D1C7] pt-8">
          <Link href="/blog" className="text-sm font-semibold text-[#185FA5] hover:underline">
            ← More Guides
          </Link>
          <Link
            href="/schools/prayagraj"
            className="text-sm font-semibold text-[#185FA5] hover:underline"
          >
            View Prayagraj Schools →
          </Link>
        </div>
      </div>
    </div>
  );
}
