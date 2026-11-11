import Link from "next/link";
import { WELLNESS_PATH, type ArticleCard } from "@/lib/wellness";

export function ArticleCardLink({ article }: { article: ArticleCard }) {
  return (
    <Link
      href={`${WELLNESS_PATH}/${article.slug}`}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm"
    >
      {article.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt=""
          loading="lazy"
          className="aspect-[1200/630] w-full object-cover"
        />
      ) : (
        <span aria-hidden className="flex aspect-[1200/630] items-center justify-center bg-emerald-50 text-4xl">
          🌿
        </span>
      )}
      <span className="flex flex-1 flex-col p-3">
        <span className="break-words font-bold text-slate-900">{article.title}</span>
        <span className="mt-1 line-clamp-3 text-xs text-slate-600">{article.metaDescription}</span>
        <span className="mt-auto pt-2 text-xs font-bold text-emerald-700">Read article →</span>
      </span>
    </Link>
  );
}
