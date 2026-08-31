# LaTeX Paper Writing

Edit or write the LaTeX document specified in $ARGUMENTS (a .tex file path, or a section name to add/revise).

## Prime rules

- **Preserve the author's voice.** Suggest, don't rewrite. If a sentence is merely different-not-better, leave it alone.
- **Read before you edit.** The file may have changed. Read it first, then make minimal, surgical edits.
- Show the exact LaTeX you changed — a diff of two lines beats a paragraph of description.

## Fixing compilation errors

Work from the FIRST error — LaTeX errors cascade.

| Message | Usual cause |
|---|---|
| `Undefined control sequence` | Typo or missing `\usepackage` |
| `File 'x.sty' not found` | Prefer a package already loaded over installing new |
| `Missing $ inserted` | Math symbol outside math mode |
| `Citation 'key' undefined` | Add the `.bib` entry, don't remove the `\cite` |

## Style guide

- Standard packages: `amsmath`, `amssymb`, `graphicx`, `hyperref`, `natbib`/`biblatex`, `booktabs`.
- Follow the venue's template if present — it's authoritative.
- Label everything: `\label{sec:...}`, `\label{fig:...}`, `\label{eq:...}`.
- Never hardcode numbers: `Figure~\ref{fig:x}`, not `Figure 3`.
- Non-breaking space before refs: `Figure~\ref{fig:x}`.
- `booktabs` rules only: `\toprule`, `\midrule`, `\bottomrule`. No vertical rules.

## Patterns

### Figure
```latex
\begin{figure}[t]
  \centering
  \includegraphics[width=\columnwidth]{figures/example.pdf}
  \caption{What the reader should take away.}
  \label{fig:example}
\end{figure}
```

### Table
```latex
\begin{table}[t]
  \centering
  \caption{Results on the held-out split.}
  \label{tab:results}
  \begin{tabular}{lcc}
    \toprule
    Method & Precision & Recall \\
    \midrule
    Baseline & 0.81 & 0.77 \\
    Ours & \textbf{0.95} & 0.89 \\
    \bottomrule
  \end{tabular}
\end{table}
```

### Citations
- `\citet{key}` as subject: "Smith et al. (2024) showed..."
- `\citep{key}` as aside: "...as shown (Smith et al., 2024)."
- Add the `.bib` entry when introducing a key.

All output in **Russian**.
