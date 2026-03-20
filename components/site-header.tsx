import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type SiteHeaderProps = {
  title?: string;
};
export function SiteHeader({ title }: SiteHeaderProps) {
  return (
    <header className='w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1 hidden lg:inline-flex' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4 hidden lg:block'
        />
        <h1 className='text-base font-medium'>{title}</h1>
      </div>
    </header>
  );
}
