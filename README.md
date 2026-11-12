# Bangla Corporate Tax Bangladesh

# Build a Professional Tax Consultancy Website for Bangladesh



## 1. Project Overview



Build a modern, professional, responsive tax consultancy website for a Bangladesh-based tax professional specializing in income tax, VAT, and tax compliance.



The website should establish professional credibility, explain available services, educate visitors about tax-related matters in Bangladesh, and convert visitors into consultation inquiries.



The intended professional is a tax practitioner and VAT consultant. However, do not invent or assume his business name, contact details, qualifications, experience, client testimonials, or authorization to provide specific services. Use editable placeholders until the owner confirms the information.



The website should feel trustworthy, premium, organized, and professional—not like a generic template or an overly colorful startup landing page.



**Primary objective:** Generate qualified client inquiries and consultation requests.



**Secondary objectives:**



* Build an authoritative online presence.

* Publish useful tax information in Bangla and English.

* Make service information and document requirements easy to understand.

* Reduce repetitive communication through FAQs and checklists.

* Provide an admin dashboard to manage inquiries and publish articles.



## 2. Technology Stack



Use the following technologies where supported by the existing project:



* Frontend: React with TypeScript.

* Framework: Next.js if the project supports it; otherwise, use the existing supported React setup.

* Styling: Tailwind CSS.

* UI components: Accessible, reusable components.

* Backend and database: Supabase.

* Authentication: Supabase Auth for authorized administrators.

* Database: PostgreSQL through Supabase.

* File storage: Private Supabase Storage buckets only if document uploads are implemented.

* Icons: Lucide icons.

* Forms: Client-side and server-side validation.

* Deployment: Make the application suitable for deployment on Vercel or another compatible hosting platform.



Inspect the existing repository before changing its structure. Preserve working functionality and avoid unnecessary dependencies.



Never expose service-role keys, secret credentials, or privileged database access in frontend code.



## 3. Design Direction



Create a premium financial and professional-services design.



### Color palette



* Deep navy blue for the primary brand color.

* White and soft off-white for backgrounds.

* Muted gold for restrained accents.

* Charcoal gray for body text.

* Subtle gray borders and dividers.



### Visual style



* Clean layouts with generous whitespace.

* Professional typography with excellent readability.

* Clear headings and strong visual hierarchy.

* Subtle hover effects and lightweight transitions.

* Consistent spacing, buttons, cards, and form styles.

* Professional business imagery only where it adds value.

* Avoid excessive gradients, glassmorphism, animations, and decorative elements.



The website must work well on mobile phones, tablets, laptops, and desktop screens.



Use a polished, mobile-friendly navigation bar with a clear consultation CTA.



## 4. Website Pages



### Page 1: Home



Create a compelling homepage with the following sections.



**A. Navigation**



* Logo or editable business name.

* Home.

* About.

* Services.

* Tax Resources.

* FAQs.

* Contact.

* Primary CTA: “Book a Consultation.”



On mobile, use a functional accessible menu.



**B. Hero section**



Use a professional headline such as:



“Tax & VAT Consultancy for Individuals and Businesses in Bangladesh”



Supporting text:



“Practical guidance for tax compliance, VAT matters, and financial documentation—tailored to your needs.”



Primary button: “Request a Consultation”



Secondary button: “Explore Our Services”



Use a professional image or understated financial-themed visual.



Do not promise guaranteed tax savings, guaranteed approvals, guaranteed refunds, or guaranteed legal outcomes.



**C. Trust and professional introduction**



Display verified professional credentials, relevant experience, and service focus.



Until the owner provides verified information, use editable placeholders rather than fabricated statistics, badges, or awards.



**D. Featured services**



Display service cards for:



* Individual Income Tax Assistance.

* Business Tax Compliance.

* VAT Consultancy.

* Tax Return Preparation Assistance.

* TIN-Related Guidance.

* Tax Notice and Documentation Assistance.

* Tax Compliance Consultation.



These are proposed service categories. Make every service editable and allow the owner to disable services he does not offer.



Each card should include a short description and a “Learn More” link.



**E. How it works**



Show a simple four-step process:



1. Choose the service you need.

2. Submit a consultation request.

3. Receive confirmation and the required-document checklist.

4. Discuss your requirements with the consultant.



Clearly explain that submitting an inquiry does not automatically create a professional-client relationship or guarantee that a service will be provided.



**F. Why choose this consultancy?**



Provide editable content about:



* Clear communication.

* Organized documentation.

* Practical guidance.

* Professional confidentiality.

* Personalized consultations.



Do not make unsupported claims about years of experience, client counts, success rates, or results.



**G. Featured tax resources**



Display the latest published articles, including their titles, categories, publication dates, and reading links.



**H. FAQ preview**



Include frequently asked questions about consultations, documents, income tax, VAT, and service procedures.



**I. Final CTA**



Headline: “Need Help Understanding Your Tax Requirements?”



Text: “Tell us what you need help with, and request a consultation.”



Button: “Contact the Consultant”



**J. Footer**



Include:



* Business name.

* Confirmed professional details.

* Navigation links.

* Service links.

* Contact information.

* Privacy Policy.

* Terms of Use.

* Professional disclaimer.

* Copyright year generated dynamically.



Do not display fake addresses, phone numbers, social media links, or office hours.



### Page 2: About



Create a professional profile page containing:



* Consultant's name and professional photograph, if provided.

* Professional biography.

* Confirmed qualifications and certifications.

* Relevant professional experience.

* Areas of specialization.

* Professional approach.

* Verified professional affiliations, where applicable.

* Contact CTA.



Use placeholders for unconfirmed information.



Do not claim membership, licensing, government affiliation, or official endorsement without verification.



### Page 3: Services



Create a detailed services page with individual sections for each enabled service.



For each service, provide:



* Service title.

* Description.

* Who may need the service.

* What the consultant may help with.

* Typical documents that may be requested, clearly marked as subject to individual circumstances.

* Consultation process.

* CTA to request assistance.



Potential service categories:



1. Individual Income Tax Assistance.

2. Business and Corporate Tax Compliance.

3. VAT Consultancy and Compliance.

4. Tax Return Documentation.

5. TIN-Related Assistance.

6. Tax Notices and Documentation Support.

7. Tax Compliance Reviews.

8. General Tax Consultation.



Keep the content informative and avoid presenting general information as individualized legal or tax advice.



Do not promise that the consultant can perform a government transaction unless the service and authorization have been confirmed.



### Page 4: Consultation Booking and Inquiry Form



Build a working consultation request form.



Fields:



* Full name.

* Email address.

* Phone number.

* Preferred contact method.

* Client category: Individual, Business, or Other.

* Service category.

* Preferred consultation date or time, optional.

* Short description of the request.

* Preferred language: Bangla or English.

* Consent checkbox for being contacted about the inquiry.



Requirements:



* Validate required fields.

* Validate email and phone formats sensibly.

* Show loading, success, and error states.

* Prevent duplicate submissions where practical.

* Save submitted inquiries to Supabase.

* Show a clear confirmation message after successful submission.

* Notify the administrator using a configured notification provider if available.

* If notification credentials are unavailable, save the inquiry and display it in the admin dashboard without pretending an email was sent.



Privacy and security:



* Do not request national ID numbers, tax returns, bank statements, passwords, or other highly sensitive documents in this initial public form.

* Tell users not to enter sensitive personal or financial information in the description.

* Protect the database with appropriate Supabase Row Level Security policies.

* Anonymous visitors must be able to submit inquiries but must not be able to read other inquiries.

* Only authorized administrators may access inquiry records.



### Page 5: Tax Knowledge Center



Build a resource center for Bangladesh tax-related education.



Features:



* Article listing.

* Search by title and keywords.

* Categories.

* Tags.

* Article detail pages.

* Related articles.

* Publication and last-updated dates.

* Responsive Bangla and English content support.



Suggested categories:



* Personal Income Tax.

* Business Tax.

* VAT.

* Tax Documentation.

* TIN and Tax Registration.

* Tax Deadlines.

* Frequently Asked Questions.

* Official Tax Updates.



Each article should support:



* Title.

* URL slug.

* Summary.

* Article body.

* Language.

* Category.

* Author.

* Publication date.

* Last-updated date.

* SEO title and meta description.

* Draft or published status.



Create only a few clearly labeled sample articles. Do not invent current tax rates, deadlines, exemptions, or legal requirements. Use verified, dated information and link to relevant official Bangladesh NBR resources when appropriate.



Provide an explicit last-verified date for time-sensitive information.



If current rules cannot be verified, label the content as a draft for professional review rather than publishing it as confirmed guidance.



### Page 6: Frequently Asked Questions



Create searchable, categorized FAQs about:



* Consultation booking.

* What information to prepare.

* Individual and business tax services.

* VAT-related services.

* Consultation fees.

* Confidentiality.

* Response times.

* Government filing procedures.



Answers must be editable by the administrator.



Do not invent fees, turnaround times, or eligibility rules. Display “Contact us for details” where the owner has not provided confirmed information.



### Page 7: Contact



Include:



* Contact form or inquiry CTA.

* Confirmed email and phone details.

* WhatsApp contact link if provided.

* Office address and map only if confirmed.

* Business hours only if provided.

* Links to verified professional social profiles.



Make contact information easy to find on mobile.



### Page 8: Privacy Policy and Terms



Create editable legal-information pages explaining:



* What information is collected.

* Why inquiry information is collected.

* How information is stored and accessed.

* How visitors may request access to or deletion of their information.

* Third-party services used by the website.

* Limitations of general educational content.

* The fact that a consultation request is not a guarantee of service.



Mark the legal pages for review before launch. Do not claim legal compliance merely because these pages exist.



## 5. Admin Dashboard



Create a protected admin dashboard for the website owner.



Only authorized administrators should access this area.



### Dashboard overview



Display:



* Total inquiries.

* New inquiries.

* In-progress inquiries.

* Completed inquiries.

* Number of published articles.



Use real database counts rather than hardcoded demonstration values.



### Inquiry management



Allow authorized administrators to:



* View inquiries.

* Search and filter by date, service, and status.

* Open inquiry details.

* Update status: New, Contacted, In Progress, Completed, or Archived.

* Add private internal notes.

* Delete records when appropriate.

* Export selected inquiry data to CSV, if implemented securely.



Do not allow public visitors to access this information.



### Article management



Allow authorized administrators to:



* Create articles.

* Edit drafts.

* Publish and unpublish articles.

* Manage categories and tags.

* Preview articles before publication.

* Set SEO metadata.

* Update the last-verified date.



### Website content settings



Allow the owner to update:



* Business name.

* Logo.

* Professional biography.

* Confirmed credentials.

* Service descriptions.

* Contact information.

* Social links.

* Consultation instructions.

* Footer content.



Do not require a developer to change ordinary business information.



## 6. Optional WhatsApp Integration



If the owner supplies a verified WhatsApp business number, add a “Contact on WhatsApp” button.



The button should open a correctly formatted WhatsApp conversation link with a short, editable introductory message.



Do not invent a phone number or automatically send messages without user action.



The contact form must remain functional even if WhatsApp is not configured.



## 7. Database Design



Use a clean, maintainable Supabase schema.



Suggested tables:



**site_settings**



* id

* business_name

* logo_url

* biography

* contact_email

* contact_phone

* whatsapp_number

* office_address

* business_hours

* updated_at



**services**



* id

* title

* slug

* short_description

* full_description

* enabled

* display_order

* created_at

* updated_at



**inquiries**



* id

* full_name

* email

* phone

* preferred_contact_method

* client_category

* service_id

* preferred_time

* message

* preferred_language

* status

* internal_notes

* consent_at

* created_at

* updated_at



**articles**



* id

* title

* slug

* summary

* body

* language

* category

* author

* status

* seo_title

* meta_description

* published_at

* last_verified_at

* created_at

* updated_at



**faq_items**



* id

* question

* answer

* category

* enabled

* display_order

* created_at

* updated_at



Use UUIDs where appropriate, timestamps, foreign keys, and database constraints.



Use migrations or SQL scripts to make the schema reproducible.



Configure Row Level Security for every exposed table. Public users should only access explicitly public published content and submit inquiries through a secure, narrowly scoped mechanism. Never give anonymous users unrestricted read or write access to private records.



Keep administrator privileges server-side and validate submitted data on the server.



## 8. Search Engine Optimization



Implement:



* Descriptive page titles.

* Unique meta descriptions.

* Canonical URLs.

* Semantic HTML.

* Sitemap.

* Robots.txt.

* Open Graph metadata.

* Meaningful image alt text.

* Clean, readable URLs.

* Internal links between relevant services and articles.

* Structured data only where appropriate and truthful.



Support Bangla and English content, including correct Bangla typography.



Use natural, helpful keywords related to tax consultancy in Bangladesh without keyword stuffing.



Do not promise first-page Google rankings or guaranteed client acquisition.



## 9. Security, Privacy, and Reliability



Implement:



* Supabase Row Level Security.

* Server-side validation.

* Secure authentication for administrators.

* Least-privilege database access.

* Rate limiting or abuse protection for public forms where feasible.

* Safe error handling.

* No secrets in frontend bundles or committed source code.

* No unnecessary collection of sensitive financial information.

* A clear privacy notice.

* Accessible form labels and keyboard navigation.



Do not upload or store client tax documents in the initial MVP. If document handling is introduced later, use private storage, strict access controls, short-lived signed URLs where appropriate, and a documented retention policy.



## 10. Performance and Accessibility



The website should:



* Load quickly on typical Bangladeshi mobile connections.

* Use responsive image sizes and lazy loading where appropriate.

* Avoid unnecessary JavaScript.

* Have readable contrast and typography.

* Support keyboard navigation.

* Provide visible focus states.

* Include accessible labels and error messages.

* Work on modern mobile and desktop browsers.



## 11. Development Phases



Build the application in these phases instead of generating everything at once.



**Phase 1: Public website**



* Shared design system.

* Navigation and footer.

* Homepage.

* About page.

* Services page.

* Contact page.

* Responsive layouts.

* Editable placeholders.



**Phase 2: Working inquiry system**



* Supabase connection.

* Database schema and migrations.

* Inquiry form.

* Server-side validation.

* Row Level Security.

* Confirmation and error states.



**Phase 3: Admin dashboard**



* Administrator authentication.

* Inquiry management.

* Website settings.

* Protected routes and database permissions.



**Phase 4: Tax knowledge center**



* Article listings and detail pages.

* Search and categories.

* Admin publishing tools.

* SEO metadata and official references.



**Phase 5: Final quality assurance**



* Test mobile layouts.

* Test form submission.

* Test unauthorized access.

* Verify Row Level Security.

* Check broken links and empty states.

* Verify that unconfigured integrations fail gracefully.

* Prepare deployment instructions.



## 12. Acceptance Criteria



The project is complete only when:



1. All main pages work on mobile and desktop.

2. Navigation links point to real pages.

3. The inquiry form validates and stores data correctly.

4. Unauthorized visitors cannot read private inquiries or internal notes.

5. The admin dashboard requires authentication.

6. An administrator can update inquiries and publish articles.

7. Contact links use only confirmed information.

8. Sample tax content is clearly labeled and does not invent current laws or deadlines.

9. Loading, empty, error, and success states are handled.

10. No secret credentials are exposed.

11. Database migrations and environment-variable instructions are documented.

12. The website can be deployed without relying on undocumented Lovable-managed services.



## Final I

nstruction



First inspect the existing project and identify its framework, installed packages, and current backend configuration. Then implement Phase 1 and show me the completed pages before proceeding to later phases.



Do not create fake testimonials, fake customer statistics, fabricated qualifications, invented tax rules, or nonfunctional buttons.



Prioritize a trustworthy design, clear service information, a working inquiry flow, strong privacy protections, and maintainable code.



The final product should look like a professional consultancy business website ready for its owner to review and customize before launch.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bangla-tax-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6d2f9938-cea5-4817-a9d3-8824d6a7fe10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
