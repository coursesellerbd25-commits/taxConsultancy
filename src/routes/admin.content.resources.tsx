
          {/* Official Source tab */}
          {activeTab === "sources" && (
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="font-semibold text-[#243653]">Official Source Card</h2>
                  <p className="mt-1 text-sm text-slate-500">Edit the information and destination link shown in the public Resources page.</p>
                </div>
                <div className="space-y-4">
                  <FormField label="Card title">
                    <input value={settingsForm.source_title} onChange={(event) => setSettingsForm({ ...settingsForm, source_title: event.target.value })} className={inputClass} placeholder="Official source" />
                  </FormField>
                  <FormField label="Description">
                    <textarea rows={4} value={settingsForm.source_description} onChange={(event) => setSettingsForm({ ...settingsForm, source_description: event.target.value })} className={`${inputClass} resize-y`} placeholder="Explain why visitors should consult this source..." />
                  </FormField>
                  <FormField label="Link label">
                    <input value={settingsForm.source_link_label} onChange={(event) => setSettingsForm({ ...settingsForm, source_link_label: event.target.value })} className={inputClass} placeholder="National Board of Revenue (nbr.gov.bd)" />
                  </FormField>
                  <FormField label="Source URL">
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="url" value={settingsForm.source_url} onChange={(event) => setSettingsForm({ ...settingsForm, source_url: event.target.value })} className={`${inputClass} pl-9`} placeholder="https://nbr.gov.bd/" />
                    </div>
                  </FormField>
                  {settingsError && <InlineError>{settingsError}</InlineError>}
                  <div className="flex justify-end border-t border-slate-100 pt-4">
                    <button type="button" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60">
                      {saveSettingsMutation.isPending && <Loader2 size={16} className="animate-spin" />} Save Source Card
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#243653]">Public card preview</p>
                <div className="rounded-md bg-[#F4F6F8] p-6">
                  <h3 className="text-lg font-semibold text-[#243653]">{settingsForm.source_title || "Official source"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{settingsForm.source_description || "Your source description will appear here."}</p>
                  <a href={isValidHttpUrl(settingsForm.source_url) ? settingsForm.source_url : undefined} target="_blank" rel="noopener noreferrer" onClick={(event) => { if (!isValidHttpUrl(settingsForm.source_url)) event.preventDefault(); }} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#243653] hover:underline">
                    {settingsForm.source_link_label || "Source link label"} <ExternalLink size={15} />
                  </a>
                </div>
                <p className="text-xs leading-5 text-slate-400">This preview follows the content structure of the public Resources page. The live page must read from <code>resource_page_settings</code> for saved changes to appear.</p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Add/edit resource modal */}
      {showResourceEditor && (
        <Modal title={editingResource ? "Edit Resource" : "Add New Resource"} subtitle="Add an external tax guide, useful link, or downloadable document." onClose={resetResourceEditor}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            <FormField label="Resource title *">
              <input value={resourceForm.title} onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })} className={inputClass} placeholder="e.g. Bangladesh Income Tax Guide 2026" />
            </FormField>
            <FormField label="Short description">
              <textarea rows={3} value={resourceForm.description} onChange={(event) => setResourceForm({ ...resourceForm, description: event.target.value })} className={`${inputClass} resize-y`} placeholder="Briefly explain what visitors will find in this resource..." />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category *">
                <select value={resourceForm.category_id} onChange={(event) => setResourceForm({ ...resourceForm, category_id: event.target.value })} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.filter((category) => category.enabled || category.id === editingResource?.category_id).map((category) => <option key={category.id} value={category.id}>{category.name}{category.enabled ? "" : " (Disabled)"}</option>)}
                </select>
              </FormField>
              <FormField label="Display order">
                <input type="number" value={resourceForm.display_order} onChange={(event) => setResourceForm({ ...resourceForm, display_order: event.target.value })} className={inputClass} />
                <p className="mt-1 text-xs text-slate-400">Lower numbers appear first.</p>
              </FormField>
            </div>
            <FormField label="External resource URL">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="url" value={resourceForm.external_url} onChange={(event) => setResourceForm({ ...resourceForm, external_url: event.target.value })} className={`${inputClass} pl-9`} placeholder="https://example.com/tax-guide" />
              </div>
              <p className="mt-1 text-xs text-slate-400">Add the website or official document URL. You may also upload a file below.</p>
            </FormField>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Optional downloadable document</label>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(event) => handleFileChange(event.target.files?.[0])} className="hidden" id="resource-file-upload" />
                <label htmlFor="resource-file-upload" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#B7792B] shadow-sm"><FileUp size={21} /></div>
                  <span className="text-sm font-medium text-[#243653]">Choose a document to upload</span>
                  <span className="text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX · Maximum 10 MB</span>
                </label>
                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0 text-[#B7792B]" /><span className="truncate text-sm text-slate-700">{selectedFile.name}</span></div>
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-slate-400 hover:text-red-600" aria-label="Remove selected file"><X size={16} /></button>
                  </div>
                )}
                {!selectedFile && editingResource?.file_name && !removeCurrentFile && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="truncate text-sm text-slate-600">Current file: {editingResource.file_name}</span>
                    <button type="button" onClick={() => setRemoveCurrentFile(true)} className="shrink-0 text-xs font-medium text-red-600 hover:underline">Remove</button>
                  </div>
                )}
                {removeCurrentFile && <p className="mt-3 text-xs text-amber-700">The existing uploaded file will be removed when you save.</p>}
              </div>
            </div>
            <FormField label="Last verified date">
              <input type="date" value={resourceForm.last_verified_at} onChange={(event) => setResourceForm({ ...resourceForm, last_verified_at: event.target.value })} className={inputClass} />
              <p className="mt-1 text-xs text-slate-400">Optional. Useful for tax and regulatory information that may change.</p>
            </FormField>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
              <div><p className="text-sm font-medium text-[#243653]">Publish resource</p><p className="mt-1 text-xs text-slate-500">Published resources can appear on the public website.</p></div>
              <input type="checkbox" checked={resourceForm.enabled} onChange={(event) => setResourceForm({ ...resourceForm, enabled: event.target.checked })} className="h-4 w-4 accent-[#243653]" />
            </label>
            {resourceError && <InlineError>{resourceError}</InlineError>}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={resetResourceEditor} disabled={saveResourceMutation.isPending} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={() => { setResourceError(""); saveResourceMutation.mutate(); }} disabled={saveResourceMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:cursor-not-allowed disabled:opacity-60">
              {saveResourceMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingResource ? "Save Changes" : "Add Resource"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add/edit category modal */}
      {showCategoryEditor && (
        <Modal title={editingCategory ? "Edit Category" : "Add Category"} subtitle="Categories are displayed on the public Resources page." onClose={() => setShowCategoryEditor(false)}>
          <div className="space-y-4 p-5 sm:p-6">
            <FormField label="Category name *"><input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={inputClass} placeholder="e.g. Income Tax Guides" /></FormField>
            <FormField label="Display order"><input type="number" value={categoryForm.display_order} onChange={(event) => setCategoryForm({ ...categoryForm, display_order: event.target.value })} className={inputClass} /></FormField>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4"><div><p className="text-sm font-medium text-[#243653]">Show category on website</p><p className="mt-1 text-xs text-slate-500">Disabled categories are hidden from public visitors.</p></div><input type="checkbox" checked={categoryForm.enabled} onChange={(event) => setCategoryForm({ ...categoryForm, enabled: event.target.checked })} className="h-4 w-4 accent-[#243653]" /></label>
            {categoryError && <InlineError>{categoryError}</InlineError>}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={() => setShowCategoryEditor(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => { setCategoryError(""); saveCategoryMutation.mutate(); }} disabled={saveCategoryMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b2940] disabled:opacity-60">{saveCategoryMutation.isPending && <Loader2 size={16} className="animate-spin" />}{editingCategory ? "Save Changes" : "Add Category"}</button>
          </div>
        </Modal>
      )}

      {/* Delete confirmations */}
      {deleteResourceTarget && (
        <ConfirmDelete
          title="Delete this resource?"
          description={<>Are you sure you want to delete <strong className="text-slate-700">{deleteResourceTarget.title}</strong>? This action cannot be undone.</>}
          pending={deleteResourceMutation.isPending}
          onCancel={() => setDeleteResourceTarget(null)}
          onConfirm={() => deleteResourceMutation.mutate(deleteResourceTarget)}
        />
      )}
      {deleteCategoryTarget && (
        <ConfirmDelete
          title="Delete this category?"
          description={<>Are you sure you want to delete <strong className="text-slate-700">{deleteCategoryTarget.name}</strong>? Categories containing resources cannot be deleted.</>}
          pending={deleteCategoryMutation.isPending}
          onCancel={() => setDeleteCategoryTarget(null)}
          onConfirm={() => deleteCategoryMutation.mutate(deleteCategoryTarget)}
        />
      )}
    </div>
  );
}
