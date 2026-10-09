"""
بيانات تدريب لتصنيف حالة طلب التوظيف.
كل عنصر: (نص الملاحظة، الحالة)
الحالات: saved, applied, interview, offer, rejected
"""

TRAINING_DATA = [
    # ═══ SAVED ═══
    ("Saved this job to apply later", "saved"),
    ("Bookmarked the position, looks interesting", "saved"),
    ("Added to my wishlist, will apply soon", "saved"),
    ("Just saved, need to review requirements", "saved"),
    ("Saved for later consideration", "saved"),
    ("Not sure yet, saved to decide", "saved"),
    ("Bookmarked from LinkedIn", "saved"),
    ("Found this on Indeed, saving it", "saved"),
    ("Will review this weekend", "saved"),
    ("Saved the link for now", "saved"),
    ("Interesting role, saved for later", "saved"),

    # ═══ APPLIED ═══
    ("Just submitted my application", "applied"),
    ("Sent my CV through the website", "applied"),
    ("Applied online today", "applied"),
    ("Submitted application form", "applied"),
    ("Applied via LinkedIn Easy Apply", "applied"),
    ("Sent my resume to HR", "applied"),
    ("Application sent, waiting for response", "applied"),
    ("Filled out the application, submitted", "applied"),
    ("Applied through the company portal", "applied"),
    ("Sent cover letter and resume", "applied"),
    ("Submitted my application last night", "applied"),
    ("Application submitted, no reply yet", "applied"),
    ("Applied a week ago, no update", "applied"),

    # ═══ INTERVIEW ═══
    ("They called me for a phone screen", "interview"),
    ("Scheduled first interview next week", "interview"),
    ("Had a great interview today", "interview"),
    ("Technical interview went well", "interview"),
    ("HR scheduled a video call", "interview"),
    ("Invited for an onsite interview", "interview"),
    ("Second round interview scheduled", "interview"),
    ("Meeting with the team tomorrow", "interview"),
    ("Interview with hiring manager next Monday", "interview"),
    ("They want to schedule a call", "interview"),
    ("Phone screen scheduled for Friday", "interview"),
    ("Final round interview coming up", "interview"),
    ("Interview panel went great", "interview"),
    ("They asked me to come in for an interview", "interview"),
    ("Zoom interview scheduled", "interview"),

    # ═══ OFFER ═══
    ("Got an offer letter today!", "offer"),
    ("They offered me the position", "offer"),
    ("Received a job offer", "offer"),
    ("HR sent the offer, reviewing it", "offer"),
    ("Verbal offer received, waiting for written", "offer"),
    ("They want me to join next month", "offer"),
    ("Offer letter received, negotiating salary", "offer"),
    ("Got the job! Offer pending signature", "offer"),
    ("They offered a great package", "offer"),
    ("Received formal offer via email", "offer"),
    ("Accepted the offer, starting soon", "offer"),
    ("Offer negotiation in progress", "offer"),

    # ═══ REJECTED ═══
    ("They rejected my application", "rejected"),
    ("Got a rejection email today", "rejected"),
    ("Not moving forward with my candidacy", "rejected"),
    ("They went with another candidate", "rejected"),
    ("Rejected after the first round", "rejected"),
    ("Position filled by someone else", "rejected"),
    ("Received rejection letter", "rejected"),
    ("They said no, moving on", "rejected"),
    ("Application was declined", "rejected"),
    ("Unsuccessful this time", "rejected"),
    ("They passed on my application", "rejected"),
    ("Rejected after final interview", "rejected"),
    ("Didn't get the job", "rejected"),
]