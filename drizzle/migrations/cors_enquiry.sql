
-- Allow public visitors to submit enquiries
CREATE POLICY "Public can submit enquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow verified administrators to view enquiries
CREATE POLICY "Admins can view enquiries"
ON public.inquiries
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow verified administrators to update enquiries
CREATE POLICY "Admins can update enquiries"
ON public.inquiries
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow verified administrators to delete enquiries
CREATE POLICY "Admins can delete enquiries"
ON public.inquiries
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
