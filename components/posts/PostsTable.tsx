import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import posts from '@/data/posts';
import { Post } from '@/types/posts';

type PostsTableProps = {
  limit?: number;
  title?: string;
};

const PostsTable = ({ limit, title }: PostsTableProps) => {
  // Sort posts by date in descending order
  const sortedPosts: Post[] = [...posts].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  // Filter posts by limit
  const filteredPosts = limit ? sortedPosts.slice(0, limit) : sortedPosts;

  return (
    <div className='mt-10'>
      <h3 className='text-2xl font-semibold mb-4'>{title ? title : 'Posts'}</h3>
      <Table>
        <TableCaption>A list of recent posts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className='hidden md:table-cell'>Author</TableHead>
            <TableHead className='hidden md:table-cell text-right'>
              Date
            </TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </TableCell>
              <TableCell className='hidden md:table-cell'>
                {post.author}
              </TableCell>
              <TableCell className='hidden md:table-cell text-right'>
                {post.date}
              </TableCell>
              <TableCell>
                <Link href={`/posts/edit/${post.id}`}>
                  <button className='bg-amber-300 hover:bg-amber-700 text-white font-semibold py-1 px-2 rounded text-sm'>
                    Edit
                  </button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default PostsTable;
