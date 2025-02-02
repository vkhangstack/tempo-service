import { IconButton } from '@/components/icon';

export default function SendTeams() {
  return (
    <div className="flex items-center justify-center">
      <IconButton
        className="h-8 rounded-xl bg-hover py-2 text-xs font-bold"
        onClick={() => {
          console.log('first item selected');
        }}
        // icon={<}
      >
        <div className="flex items-center justify-center gap-2">
          <h1>Daily to Teams</h1>
        </div>
      </IconButton>
    </div>
  );
}
